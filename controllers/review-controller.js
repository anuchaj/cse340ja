const reviewModel = require("../models/review-model");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");

const reviewCont = {};

/***********************************
 * Vehicle/Inventory detail view
 * and process reviews submisiom
 ***********************************/
reviewCont.submitReview = [
  body("user_name").trim().isLength({ min: 2, max: 50 }).withMessage("User name must be 2-50 characters"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").trim().isLength({ min: 10, max: 500 }).withMessage("Comment must be 10-500 characters").customSanitizer((value) => sanitizeHtml(value)),

  async (req, res, next) => {
    console.log("Received review submission:", req.body); // Log incoming data
    const errors = validationResult(req);
    const { inv_id, user_name, rating, comment } = req.body; 

    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array()); // Log validation errors
      try {
        const inv_id_num = parseInt(inv_id) || 0; // Fallback to avoid NaN
        const data = await invModel.getVehicleById(inv_id_num);
        if (!data || data.length === 0) {
          throw new Error("Vehicle not found");
        }
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id_num);
        const grid = await utilities.buildVehicleDetail(data);
        let nav = await utilities.getNav();
        return res.render("inventory/vehicle-detail", {
          title: `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`,
          nav,
          grid,
          reviews,
          vehicle: data[0],
          errors: errors.array(),
          success: "",
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
      res.redirect(`/inventory/vehicle-detail/${inv_id}`);
    } catch (error) {
      console.error("Error saving review:", error);
      next(error);
    }
  },
];

module.exports = reviewCont;