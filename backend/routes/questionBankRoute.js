const express = require("express");
const {
  getAllQuestions,
  createQuestionBank,
  updateInstitute,
  deleteInstitute,
  getInstituteDetails,
  createInstituteReview,
  instituteReviews,
  deleteReview,
  getAdminQuestions,
  createInstituteResult,
  deleteMyResult,
  getInstituteResults,
  getAdminInstituteResults,
  deleteAdminResult,
  createInstituteResultPremium,
  createInstituteAdmission,
  getInstituteAdmissions,
  deleteMyAdmission,
  getAdminInstituteAdmissions,
  deleteAdminAdmission,
  createInstituteAdmissionPremium
} = require("../controllers/questionBankController");
const { isAuthenticatedCandidate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/questions").get(getAllQuestions);

router
  .route("/admin/institutes")
  .get(isAuthenticatedCandidate, getAdminQuestions);

router
  .route("/admin/questionBank/new")
  .post(isAuthenticatedCandidate, createQuestionBank);

router
  .route("/admin/institute/:id")
  .put(isAuthenticatedCandidate, updateInstitute)
  .delete(isAuthenticatedCandidate, authorizeRoles("admin"), deleteInstitute);

router.route("/institute/:id").get(getInstituteDetails);

router.route("/institute/review").put(isAuthenticatedCandidate, createInstituteReview);

router.route("/institute/reviews/:id").get(instituteReviews);
  
router.route("/institute/reviews").delete(isAuthenticatedCandidate, deleteReview);

router.route("/institute/result/new").post(isAuthenticatedCandidate, createInstituteResult).get(isAuthenticatedCandidate, getInstituteResults);

router.route("/institute/result/:id").put(isAuthenticatedCandidate, deleteMyResult);

router.route("/institute/admin/result/:id").get(isAuthenticatedCandidate, getAdminInstituteResults);

router.route("/institute/admin/delete/result").put(isAuthenticatedCandidate, deleteAdminResult);

router.route("/institute/result/premium").post(isAuthenticatedCandidate, createInstituteResultPremium);

router.route("/institute/admission/new").post(isAuthenticatedCandidate, createInstituteAdmission).get(isAuthenticatedCandidate, getInstituteAdmissions);

router.route("/institute/admission/:id").put(isAuthenticatedCandidate, deleteMyAdmission);

router.route("/institute/admin/admissions/:id").get(isAuthenticatedCandidate, getAdminInstituteAdmissions);

router.route("/institute/admin/delete/admission").put(isAuthenticatedCandidate, deleteAdminAdmission);

router.route("/institute/admission/premium").post(isAuthenticatedCandidate, createInstituteAdmissionPremium);

module.exports = router;