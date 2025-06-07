const { body, validationResult } = require("express-validator")
const validate = {}

validate.inventoryRules = () => [
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900 }).withMessage("Valid year is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a number."),
  body("inv_color").notEmpty().withMessage("Color is required."),
  body("inv_description").notEmpty().withMessage("Description is required."),
  body("classification_id").notEmpty().withMessage("Classification is required."),
]

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body
    })
  }
  next()
}

module.exports = validate
