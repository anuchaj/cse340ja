// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/");
const reviewController = require("../controllers/review-controller.js") // New import

const revValidate = require("../utilities/review-validation")


// Review routes
//router.post("/review", utilities.handleErrors(reviewController.submitReview))
router.post("/submit-review", utilities.handleErrors(reviewController.submitReview));

router.post(
  "/submit-review",
  revValidate.reviewRules(),
  utilities.handleErrors(reviewController.submitReview)
)


module.exports = router;