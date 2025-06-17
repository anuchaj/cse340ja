// Importing validation functions from the express-validator library
const { body, validationResult } = require("express-validator")

// Importing utility functions (likely includes navigation and list builders)
const utilities = require("./index")

// Creating an object to hold validation functions
const validate = {}

/**
 * Validation rules for inventory form fields.
 * Each rule checks a specific input field to ensure it's present and valid.
 */
validate.inventoryRules = () => [
  // Check if 'inv_make' field is not empty after trimming whitespace
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  
  // Check if 'inv_model' field is not empty after trimming whitespace
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  
  // Check if 'inv_year' is an integer and no earlier than 1900
  body("inv_year").isInt({ min: 1900 }).withMessage("Valid year is required."),
  
  // Check if 'inv_price' is a floating-point number and no less than 0
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a number."),
  
  // Check if 'inv_miles' is an integer and no less than 0
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a number."),
  
  // Check if 'inv_color' field is not empty
  body("inv_color").notEmpty().withMessage("Color is required."),
  
  // Check if 'inv_description' field is not empty
  body("inv_description").notEmpty().withMessage("Description is required."),
  
  // Check if 'classification_id' field is not empty
  body("classification_id").notEmpty().withMessage("Classification is required."),
]

/**
 * Middleware function to check for validation errors in the submitted form data.
 * If errors are found, it re-renders the form with error messages and previously submitted data.
 */
validate.checkInventoryData = async (req, res, next) => {
  // Get validation result from the request
  const errors = validationResult(req)

  // Build the classification dropdown list, preserving selected value
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  // If there are validation errors
  if (!errors.isEmpty()) {
    // Get navigation data
    const nav = await utilities.getNav()

    // Re-render the form with error messages, navigation, and pre-filled input
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(), // Send error messages to the view
      ...req.body // Spread the submitted form values to refill the form
    })
  }

  // If no errors, proceed to the next middleware or route handler
  next()
}


/**
 * Middleware function to check for validation errors in the submitted form data.
 * If errors are found, errors will be directed back to the edit view.
 */
validate.checkUpdateData = async (req, res, next) => {
  // Get validation result from the request
  const errors = validationResult(req)

  // Destructure required fields from the request body
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    classification_id
  } = req.body

  // Build the classification dropdown list, preserving selected value
  const classificationList = await utilities.buildClassificationList(classification_id)

  // If there are validation errors
  if (!errors.isEmpty()) {
    // Get navigation data
    const nav = await utilities.getNav()

    // Generate title (e.g., "Edit 2020 Toyota Camry")
    const title = `Edit ${inv_year} ${inv_make} ${inv_model}`

    // Re-render the edit-inventory view with error messages and input values
    return res.render("inventory/edit-inventory", {
      title,
      nav,
      classificationList,
      errors: errors.array(), // Send error messages to the view
      inv_id, // Ensure the view knows which item is being edited
      ...req.body // Spread the submitted form values to refill the form
    })
  }

  // If no errors, proceed to the next middleware or route handler
  next()
}


// Export the validate object so it can be used in other modules
module.exports = validate
