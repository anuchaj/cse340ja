// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
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

// A new route that works with the URL in the JavaScript file
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


// Route to render the edit form for a specific inventory item by ID
router.get(
  "/edit/:inv_id", 
  utilities.handleErrors(invController.buildEditInventoryView)
);


// Route to handle the update inventory form submission
router.post(
  "/edit-inventory",
  invValidate.inventoryRules(), // validation middleware
  invValidate.checkInventoryData, // Validation result handler
  utilities.handleErrors(invController.updateInventory) // update handler in controller
);


// Trigger Intentional Error
router.get("/trigger-error", invController.triggerError);

module.exports = router;


