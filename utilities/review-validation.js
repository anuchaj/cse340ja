// Importing validation functions from the express-validator library
const { body, validationResult } = require("express-validator")

// Creating an object to hold validation functions
const validate = {}

/**
 * Validation rules for reviews form fields.
 */
validate.reviewRules = () => [
    body("user_name").trim().isLength({ min: 2, max: 50 }).withMessage("User name must be 2-50 characters"),

    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

    body("comment").trim().isLength({ min: 10, max: 500 }).withMessage("Comment must be 10-500 characters").customSanitizer((value) => sanitizeHtml(value)),

]


// Export the validate object so it can be used in other modules
module.exports = validate