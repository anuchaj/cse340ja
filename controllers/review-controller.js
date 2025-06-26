const reviewModel = require("../models/review-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/"); // Ensure utilities is imported
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");

const reviewCont = {};

/***********************************
 * Vehicle/Inventory detail view
 * and process reviews submission
 ***********************************/
// The submitReview function will be an array of middleware.
// utilities.handleErrors will now wrap the async function at the end of the array.
reviewCont.submitReview = [
  // Validation rules
  body("user_name").trim().isLength({ min: 2, max: 50 }).withMessage("User name must be 2-50 characters"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").trim().isLength({ min: 10, max: 500 }).withMessage("Comment must be 10-500 characters").customSanitizer((value) => sanitizeHtml(value)),

  // The actual controller logic, wrapped by utilities.handleErrors
  utilities.handleErrors(async (req, res, next) => { // <--- Apply handleErrors here
    console.log("Received review submission:", req.body); // Log incoming data
    const errors = validationResult(req);
    const { inv_id, user_name, rating, comment } = req.body;

    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array()); // Log validation errors
      try {
        const inv_id_num = parseInt(inv_id) || 0;
        const vehicleData = await invModel.getVehicleById(inv_id_num);

        if (!vehicleData) {
          throw new Error("Vehicle not found");
        }
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id_num);
        const grid = await utilities.buildVehicleDetail(vehicleData);
        let nav = await utilities.getNav();

        return res.render("inventory/vehicle-detail", {
          title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
          nav,
          grid,
          reviews,
          inv_id: vehicleData.inv_id,
          errors: errors.array(),
          success: req.flash("success"),
          user_name: user_name,
          rating: rating,
          comment: comment,
        });
      } catch (error) {
        console.error("Error rendering after validation failure:", error);
        return next(error);
      }
    }

    try {
      console.log("Saving review:", { inv_id, user_name, rating, comment });
      await reviewModel.addReview(parseInt(inv_id), user_name, parseInt(rating), comment);
      req.flash("success", "Review submitted successfully!");
      res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
      console.error("Error saving review:", error);
      req.flash("error", "Failed to add review. Please try again.");
      res.redirect(`/inv/detail/${inv_id}`);
    }
  }), // <--- Close utilities.handleErrors wrapper here
];

module.exports = reviewCont;

