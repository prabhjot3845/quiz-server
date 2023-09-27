const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Candidate = require("../models/candidateModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { start } = require("repl");


// Register a User
exports.registerCandidate = catchAsyncErrors(async (req, res, next) => {
  
  //  const avatar = req.files.avatar.tempFilePath;
  
  // const myCloud = await cloudinary.v2.uploader.upload(avatar);
      
  // const { name, email, password } = req.body;

  const candidate = await Candidate.create(req.body
    // {
    // name,
    // email,
    // password,
    // avatar: {
    //   public_id: myCloud.public_id,
    //   url: myCloud.secure_url,
    // },
  // }
  );
  sendToken(candidate, 201, res);
});

// Login User
exports.loginCandidate = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const candidate = await Candidate.findOne({ email }).select("+password");

  if (!candidate) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  const isPasswordMatched = await candidate.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  sendToken(candidate, 200, res);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const candidate = await Candidate.findOne({ email: req.body.email });

  if (!candidate) {
    return next(new ErrorHander("candidate not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = candidate.getResetPasswordToken();

  await candidate.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: candidate.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${candidate.email} successfully`,
    });
  } catch (error) {
    candidate.resetPasswordToken = undefined;
    candidate.resetPasswordExpire = undefined;

    await candidate.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const candidate = await Candidate.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!candidate) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not password", 400));
  }

  candidate.password = req.body.password;
  candidate.resetPasswordToken = undefined;
  candidate.resetPasswordExpire = undefined;

  await candidate.save();

  sendToken(candidate, 200, res);
});

// Get User Detail
exports.getCandidateDetails = catchAsyncErrors(async (req, res, next) => {
  const candidate = await Candidate.findById(req.candidate.id);

  res.status(200).json({
    success: true,
    candidate,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const candidate = await Candidate.findById(req.candidate.id).select("+password");

  const isPasswordMatched = await candidate.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("password does not match", 400));
  }

  candidate.password = req.body.newPassword;

  await candidate.save();

  sendToken(candidate, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  
  
  // const newCandidateData = {
  //   name: req.body.name,
  //   email: req.body.email,
  // };
// console.log(req);
//   if (req.body.avatar !== "") {
//     const candidate = await Candidate.findById(req.user.id);

//     const imageId = candidate.avatar.public_id;

//     await cloudinary.v2.uploader.destroy(imageId);

//     const avatar = req.files.avatar.tempFilePath;

//   const myCloud = await cloudinary.v2.uploader.upload(avatar);
//   console.log(myCloud.url)
  

//   fs.unlink(avatar, (err) => {
//     if (err) console.log(err);
//   });

//     newCandidateData.avatar = {
//       public_id: myCloud.public_id,
//       url: myCloud.secure_url,
//     };
//   }

  const candidate = await Candidate.findByIdAndUpdate(req.candidate.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    candidate,
  });
});

// Get all users(admin)
exports.getAllCandidate = catchAsyncErrors(async (req, res, next) => {
  const candidates = await Candidate.find();

  res.status(200).json({
    success: true,
    candidates,
  });
});

// Get single user (admin)
exports.getSingleCandidate = catchAsyncErrors(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id);

  if (!candidate) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    candidate,
  });
});

// update User Role -- Admin
exports.updateCandidateRole = catchAsyncErrors(async (req, res, next) => {
  const newCandidateData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await Candidate.findByIdAndUpdate(req.params.id, newCandidateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteCandidate = catchAsyncErrors(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id);

  if (!candidate) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const imageId = candidate.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await candidate.remove();

  res.status(200).json({
    success: true,
    message: "Candidate Deleted Successfully",
  });
});

// Delete User
exports.deleteCandidateMe = catchAsyncErrors(async (req, res, next) => {
  const candidate = await Candidate.findById(req.candidate.id);

  if (!candidate) {
    return next(
      new ErrorHander(`candidate does not exist with Id: ${req.candidate.id}`, 400)
    );
  }

  const imageId = candidate.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await candidate.remove();

  res.status(200).json({
    success: true,
    message: "Your Account Deleted Successfully",
  });
});

// Add scores
exports.addScores = catchAsyncErrors(async (req, res, next) => {
  const { newScores } = req.body;

  const candidate = await Candidate.findById(req.candidate.id);
  
  candidate.scores = candidate.scores + newScores;

  await candidate.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    candidate,
  });
});