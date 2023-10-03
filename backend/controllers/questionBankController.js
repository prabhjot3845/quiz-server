const QuestionBank = require("../models/questionBankModel");
const Candidate = require("../models/candidateModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const cloudinary = require("cloudinary");
const fs = require('fs');

// Create QuestionBank -- Admin
exports.createQuestionBank = catchAsyncErrors(async (req, res, next) => {

  req.body.candidate = req.candidate.id;
 

  const questionBank = await QuestionBank.create(req.body);
  
    res.status(201).json({
    success: true,
    questionBank,
  });
});

// Get Question By Id
exports.getQuestion = catchAsyncErrors(async (req, res, next) => {
  let question = await QuestionBank.findById(req.params.id);

  if (!question) {
    return next(new ErrorHander("Question not found", 404));
  }

  res.status(200).json({
    success: true,
    question,
  });
});

// Get All Questions
exports.getAllQuestions = catchAsyncErrors(async (req, res, next) => {
  // const resultPerPage = 10;
  const questionsCount = await QuestionBank.countDocuments();

  const apiFeature = new ApiFeatures(QuestionBank.find(), req.query)
    .search()
    .filter();
  
  // apiFeature.pagination(resultPerPage);
  let questions = await apiFeature.query;

  let filteredQuestionsCount = questions.length;

 

  res.status(200).json({
    success: true,
    questionsCount,
    resultPerPage,
    filteredQuestionsCount,
    questions,
  });
});

// Get All Questions (Admin)
exports.getAdminQuestions = catchAsyncErrors(async (req, res, next) => {
  const questions = await QuestionBank.find();

  res.status(200).json({
    success: true,
    questions,
  });
});


// Update Question (Admin)
exports.updateQuestionAdmin = catchAsyncErrors(async (req, res, next) => {
  let question = await QuestionBank.findById(req.params.id);

  if (!question) {
    return next(new ErrorHander("Question not found", 404));
  }

  question = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    question,
  });
});

// Delete Question

exports.deleteQuestion = catchAsyncErrors(async (req, res, next) => {
  const question = await QuestionBank.findById(req.params.id);

  if (!question) {
    return next(new ErrorHander("Question not found", 404));
  }
  
  await QuestionBank.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    message: "Question Deleted Successfully",
  });
});

// Create New Review or Update the review
exports.createQuestionReview = catchAsyncErrors(async (req, res, next) => {
  const { comment, questionId } = req.body;

  const review = {
    candidate: req.candidate._id,
    name: req.candidate.name,
    comment,
  };

  const question = await QuestionBank.findById(questionId);
  

  const isReviewed = question.reviews.find(
    (rev) => rev.candidate.toString() === req.candidate._id.toString()
  );

  if (isReviewed) {
    question.reviews.forEach((rev) => {
      if (rev.candidate.toString() === req.candidate._id.toString())
        (rev.comment = comment);
    });
  } else {
    question.reviews.push(review);
    question.numOfReviews = question.reviews.length;
  }

  await question.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a product
exports.questionReviews = catchAsyncErrors(async (req, res, next) => {
  const question = await QuestionBank.findById(req.params.id);

  if (!question) {
    return next(new ErrorHander("question not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: question.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const question = await QuestionBank.findById(req.query.questionId);

  if (!question) {
    return next(new ErrorHander("question not found", 404));
  }

  const reviews = question.reviews.filter(
    (rev) => rev._id.toString() !== req.query.reviewId.toString()
  );

  const numOfReviews = reviews.length;

  await QuestionBank.findByIdAndUpdate(
    req.query.questionId,
    {
      reviews,
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

