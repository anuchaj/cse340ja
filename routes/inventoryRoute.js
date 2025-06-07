// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const classValidate = require("../utilities/classification-validation")
const invValidate = require("../utilities/inventory-validation")

console.log('invController.buildDetailView:', invController.buildDetailView);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by detail view
router.get("/detail/:inv_id", invController.buildDetailView);

// Route to build management view
router.get("/", invController.buildManagement);

// Route to add-classification view
router.get("/add-classification", invController.buildAddClassification)

// Route to post add-classification view
router.post(
  "/add-classification",
  classValidate.classificationRules(),
  classValidate.checkClassificationData,
  invController.addClassification
)

// Route to add-inventory view
router.get("/add-inventory", invController.buildAddInventory)
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
)


// Trigger Intentional Error
router.get("/trigger-error", invController.triggerError);

module.exports = router;


