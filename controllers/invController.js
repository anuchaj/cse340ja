const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const invId = req.params.inv_id;
    const vehicleData = await invModel.getVehicleById(invId);
    if (!vehicleData) {
      return next(new Error("Vehicle not found"));
    }
    const grid = utilities.buildVehicleDetail(vehicleData);
    const nav = await utilities.getNav();
    res.render("inventory/vehicle-detail", {
      title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      grid,
    });
  } catch (err) {
    next(err);
  }
}

// Throw/trigger intentional error
invCont.triggerError = function (req, res, next) {
  throw new Error("Intentional server error for testing.");
}


module.exports = invCont

