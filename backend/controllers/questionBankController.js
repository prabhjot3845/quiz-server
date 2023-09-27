const QuestionBank = require("../models/questionBankModel");
const Candidate = require("../models/candidateModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");
const fs = require('fs');

// Create Institute -- Admin
exports.createQuestionBank = catchAsyncErrors(async (req, res, next) => {

  req.body.candidate = req.candidate.id;
 

  const questionBank = await QuestionBank.create(req.body);
  
    res.status(201).json({
    success: true,
    questionBank,
  });
});

// Get All Product
exports.getAllInstitutes = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 20;
  const institutesCount = await Institute.countDocuments();

  const apiFeature = new ApiFeatures(Institute.find(), req.query)
    .search()
    .filter();

  let institutes = await apiFeature.query;

  let filteredInstitutesCount = institutes.length;

  apiFeature.pagination(resultPerPage);

  // institutes = await apiFeature.query;

  res.status(200).json({
    success: true,
    institutesCount,
    resultPerPage,
    filteredInstitutesCount,
    institutes,
  });
});

// Get All Institute (Admin)
exports.getAdminInstitutes = catchAsyncErrors(async (req, res, next) => {
  const institutes = await Institute.find();

  res.status(200).json({
    success: true,
    institutes,
  });
});

// Get Institute Details
exports.getInstituteDetails = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.params.id);

  if (!institute) {
    return next(new ErrorHander("Institute not found", 404));
  }

  res.status(200).json({
    success: true,
    institute,
  });
});

// Update Institute -- Admin

exports.updateInstitute = catchAsyncErrors(async (req, res, next) => {
  let institute = await Institute.findById(req.params.instituteId);

  if (!institute) {
    return next(new ErrorHander("Institute not found", 404));
  }

  // // Images Start Here
  // let images = [];

  // if (typeof req.body.images === "string") {
  //   images.push(req.body.images);
  // } else {
  //   images = req.body.images;
  // }

  // if (images !== undefined) {
  //   // Deleting Images From Cloudinary
  //   for (let i = 0; i < product.images.length; i++) {
  //     await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  //   }

  //   const imagesLinks = [];

  //   for (let i = 0; i < images.length; i++) {
  //     const result = await cloudinary.v2.uploader.upload(images[i], {
  //       folder: "products",
  //     });

  //     imagesLinks.push({
  //       public_id: result.public_id,
  //       url: result.secure_url,
  //     });
  //   }

  //   req.body.images = imagesLinks;
  // }
//   await cloudinary.v2.uploader.destroy(institute.avatar.public_id);

//   const avatar = req.files.avatar.tempFilePath;

//   const myCloud = await cloudinary.v2.uploader.upload(avatar);
//   console.log(myCloud.url)
  

//   fs.unlink(avatar, (err) => {
//     if (err) console.log(err);
//   });
  
//   req.body.avatar = {
//     public_id: myCloud.public_id,
//     url: myCloud.secure_url,
//   },

  institute = await Institute.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    institute,
  });
});

// Delete Institute

exports.deleteInstitute = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.params.id);

  if (!institute) {
    return next(new ErrorHander("institute not found", 404));
  }

  // Deleting Images From Cloudinary
  // for (let i = 0; i < product.images.length; i++) {
  //   await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  // }

  await cloudinary.v2.uploader.destroy(institute.avatar.public_id);

  await institute.remove();

  res.status(200).json({
    success: true,
    message: "institute Deleted Successfully",
  });
});

// Create New Review or Update the review
exports.createInstituteReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, instituteId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const institute = await Institute.findById(instituteId);
  

  const isReviewed = institute.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    institute.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    institute.reviews.push(review);
    institute.numOfReviews = institute.reviews.length;
  }

  let avg = 0;

  institute.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  institute.ratings = avg / institute.reviews.length;

  await institute.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a product
exports.instituteReviews = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.params.id);

  if (!institute) {
    return next(new ErrorHander("institute not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: institute.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.query.instituteId);

  if (!institute) {
    return next(new ErrorHander("institute not found", 404));
  }

  const reviews = institute.reviews.filter(
    (rev) => rev._id.toString() !== req.query.reviewId.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Institute.findByIdAndUpdate(
    req.query.instituteId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

// Create New Result or Update the Result
exports.createInstituteResult = catchAsyncErrors(async (req, res, next) => {

  const avatar = req.files.avatar.tempFilePath;

  const myCloud = await cloudinary.v2.uploader.upload(avatar);
  console.log(myCloud.url)
  

  fs.unlink(avatar, (err) => {
    if (err) console.log(err);
  });
  
  req.body.image= {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  req.body.instituteId = req.user.instituteId;

  const institute = await Institute.findById(req.user.instituteId);

  institute.results.push(req.body);
  
  await institute.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    result: institute.result
  });
});

// Get my Results
exports.getInstituteResults = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.user.instituteId);

  console.log(institute.results.length);

  res.status(200).json({
    success: true,
    results: institute.results,
  });
});

// Delete my Result
exports.deleteMyResult = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.user.instituteId);
  console.log(institute.id);
  console.log(institute.results.length);

  const results = institute.results.filter(
    (rev) => rev._id.toString() !== req.params.id.toString()
  );
  // await cloudinary.v2.uploader.destroy(institute.avatar.public_id);
  // await cloudinary.v2.uploader.destroy(institute.results.public_id);

  numOfResultUpdates = institute.numOfResultUpdates + 1;
  
  console.log(results.length);
  console.log(institute.numOfResultUpdates);

  await Institute.findByIdAndUpdate(req.user.instituteId, 
    {
      results,
      numOfResultUpdates,
    }, 
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    results: results
  });
});

// Get Results ---Admin
exports.getAdminInstituteResults = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.params.id);

  console.log(institute.results.length);

  res.status(200).json({
    success: true,
    results: institute.results,
  });
});

// Delete Result ---- Admin
exports.deleteAdminResult = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.query.instituteId);
  console.log(institute.id);
  console.log(institute.results.length);

  const results = institute.results.filter(
    (rev) => rev._id.toString() !== req.query.resultId.toString()
  );
  // await cloudinary.v2.uploader.destroy(institute.avatar.public_id);
  // await cloudinary.v2.uploader.destroy(institute.results.public_id);

  institute.numOfResultUpdates = institute.numOfResultUpdates + 1;
  
  console.log(results.length);
  console.log(institute.numOfResultUpdates);

  await Institute.findByIdAndUpdate(req.user.instituteId, 
    {
      results,
      // numOfResultUpdates,
    }, 
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    results: results
  });
});

// Create New Result Featured
exports.createInstituteResultPremium = catchAsyncErrors(async (req, res, next) => {

  const institute = await Institute.findById(req.user.instituteId);


  if (institute.featured == false && institute.results.length >= 5) {
    return next(new ErrorHander("upgrade to Premium", 404));
  } else {
    const avatar = req.files.avatar.tempFilePath;

  const myCloud = await cloudinary.v2.uploader.upload(avatar);
  console.log(myCloud.url)
  

  fs.unlink(avatar, (err) => {
    if (err) console.log(err);
  });
  
  req.body.image= {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  req.body.instituteId = req.user.instituteId;

  institute.results.push(req.body);
  }

  await institute.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    result: institute.result
  });
});

// Create New Admission---------
exports.createInstituteAdmission = catchAsyncErrors(async (req, res, next) => {

  const avatar = req.files.avatar.tempFilePath;

  const myCloud = await cloudinary.v2.uploader.upload(avatar);
  console.log(myCloud.url)
  

  fs.unlink(avatar, (err) => {
    if (err) console.log(err);
  });
  
  req.body.image= {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  req.body.instituteId = req.user.instituteId;

  const institute = await Institute.findById(req.user.instituteId);

  institute.admissions.push(req.body);
  
  await institute.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    admissions: institute.admissions
  });
});

// Get my admissions
exports.getInstituteAdmissions = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.user.instituteId);

  console.log(institute.admissions.length);

  res.status(200).json({
    success: true,
    admissions: institute.admissions,
  });
});

// Delete my Admission
exports.deleteMyAdmission = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.user.instituteId);
  console.log(institute.id);
  console.log(institute.results.length);

  const admissions = institute.admissions.filter(
    (rev) => rev._id.toString() !== req.params.id.toString()
  );
  // await cloudinary.v2.uploader.destroy(institute.avatar.public_id);
  // await cloudinary.v2.uploader.destroy(institute.results.public_id);

  institute.numOfResultUpdates = institute.numOfResultUpdates + 1;
  
  console.log(admissions.length);
  console.log(institute.numOfResultUpdates);

  await Institute.findByIdAndUpdate(req.user.instituteId, 
    {
      admissions,
      // numOfResultUpdates,
    }, 
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    admissions: admissions
  });
});

// Get Admissions ---Admin
exports.getAdminInstituteAdmissions = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.params.id);

  console.log(institute.admissions.length);

  res.status(200).json({
    success: true,
    admissions: institute.admissions,
  });
});

// Delete Admission ---- Admin
exports.deleteAdminAdmission = catchAsyncErrors(async (req, res, next) => {
  const institute = await Institute.findById(req.query.instituteId);
  console.log(institute.id);
  console.log(institute.admissions.length);

  const admissions = institute.admissions.filter(
    (rev) => rev._id.toString() !== req.query.admissionId.toString()
  );
  // await cloudinary.v2.uploader.destroy(institute.avatar.public_id);
  // await cloudinary.v2.uploader.destroy(institute.results.public_id);

  institute.numOfResultUpdates = institute.numOfResultUpdates + 1;
  
  console.log(admissions.length);
  console.log(institute.numOfResultUpdates);

  await Institute.findByIdAndUpdate(req.user.instituteId, 
    {
      admissions,
      // numOfResultUpdates,
    }, 
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    admissions: admissions,
  });
});

// Create New Admission Featured
exports.createInstituteAdmissionPremium = catchAsyncErrors(async (req, res, next) => {

  const institute = await Institute.findById(req.user.instituteId);


  if (institute.featured == false && institute.admissions.length >= 5) {
    return next(new ErrorHander("upgrade to Premium", 404));
  } else {
    const avatar = req.files.avatar.tempFilePath;

  const myCloud = await cloudinary.v2.uploader.upload(avatar);
  console.log(myCloud.url)
  

  fs.unlink(avatar, (err) => {
    if (err) console.log(err);
  });
  
  req.body.image= {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  req.body.instituteId = req.user.instituteId;

  institute.admissions.push(req.body);
  }

  await institute.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    admissions: institute.admissions,
  });
});
