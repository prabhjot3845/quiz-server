const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const Candidate = require("../models/candidateModel");

exports.isAuthenticatedCandidate = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHander("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.candidate = await Candidate.findById(decodedData.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.candidate.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.candidate.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};
