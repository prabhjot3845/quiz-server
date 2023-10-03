const express = require("express");
const {
  createQuestionBank,
  getQuestion,
  getAllQuestions,
  updateQuestionAdmin,
  deleteQuestion,
  createQuestionReview,
  questionReviews,
  deleteReview,
  getAdminQuestions
} = require("../controllers/questionBankController");
const { isAuthenticatedCandidate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/question/:id").get(getQuestion);

router.route("/allQuestions").get(getAllQuestions);

router
  .route("/admin/questions")
  .get(isAuthenticatedCandidate, getAdminQuestions);

router
  .route("/admin/questionBank/new")
  .post(isAuthenticatedCandidate, createQuestionBank);

router
  .route("/admin/question/:id")
  .put(isAuthenticatedCandidate, authorizeRoles("admin"), updateQuestionAdmin)
  .delete(isAuthenticatedCandidate, authorizeRoles("admin"), deleteQuestion);

router.route("/question/review").put(isAuthenticatedCandidate, createQuestionReview);

router.route("/question/reviews/:id").get(questionReviews);
  
router.route("/question/reviews").delete(isAuthenticatedCandidate, deleteReview);

module.exports = router;