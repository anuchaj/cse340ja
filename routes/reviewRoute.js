// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/");
const reviewController = require("../controllers/review-controller.js") // New import

const revValidate = require("../utilities/review-validation")

// REMOVED DUPLICATE /submit-review routes from here.
// The route definition for /submit-review will now solely reside in inventoryRoute.js
// This ensures that the form action in vehicle-detail.ejs which is "/inv/submit-review"
// correctly maps to a single route.

module.exports = router;