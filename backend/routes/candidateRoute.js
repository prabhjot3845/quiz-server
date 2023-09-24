const express = require("express");
const {
  registerCandidate,
  loginCandidate,
  logout,
  forgotPassword,
  resetPassword,
  getCandidateDetails,
  updatePassword,
  updateProfile,
  getAllCandidate,
  getSingleCandidate,
  updateCandidateRole,
  deleteCandidate,
  deleteCandidateMe,
  addScores
} = require("../controllers/candidateController");
const { isAuthenticatedCandidate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerCandidate);

router.route("/login").post(loginCandidate);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(isAuthenticatedCandidate, resetPassword);

router.route("/logout").get(isAuthenticatedCandidate, logout);

router.route("/me").get(isAuthenticatedCandidate, getCandidateDetails);

router.route("/password/update").put(isAuthenticatedCandidate, updatePassword);

router.route("/me/update").put(isAuthenticatedCandidate, updateProfile);
router.route("/me/delete").delete(isAuthenticatedCandidate, deleteCandidateMe);

router
  .route("/admin/users")
  .get(isAuthenticatedCandidate, getAllCandidate);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedCandidate, authorizeRoles("admin"), getSingleCandidate)
  .put(isAuthenticatedCandidate, authorizeRoles("admin"), updateCandidateRole)
  .delete(isAuthenticatedCandidate, authorizeRoles("admin"), deleteCandidate);

router.route("/me/addScores").put(isAuthenticatedCandidate, addScores);

module.exports = router;
