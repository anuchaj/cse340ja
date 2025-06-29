// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
const reviewController = require("../controllers/review-controller.js") // New import

const classValidate = require("../utilities/classification-validation")
const invValidate = require("../utilities/inventory-validation")


console.log('invController.buildDetailView:', invController.buildDetailView);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by detail view
router.get("/detail/:inv_id", invController.buildDetailView);

// Route to build management view
router.get('/management', utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))

// Route to get add-classification view
router.get('/add-classification', utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification));
// Route to post add-classification view
router.post(
  "/add-classification",
  classValidate.classificationRules(),
  classValidate.checkClassificationData,
  utilities.checkEmployeeOrAdmin,
  invController.addClassification
)

// Route to render inventory view for necessaery modification
router.get('/add-inventory', utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory))
// Route to post add-inventory view
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.addInventory)
)


// A new route that works with the URL in the JavaScript file
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


// Route to render the edit form for a specific inventory item by ID
router.get('/edit/:inv_id', utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventoryView))
// Route to handle the update inventory form submission
router.post(
  "/edit-inventory",
  invValidate.inventoryRules(), // validation middleware; apply validation rules to the update form
  invValidate.checkUpdateData, // Validation result handler; Handle validation errors and send data back to the edit view
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.updateInventory) // Controller function to handle the update logic
);


// Route to render the edit form for a specific inventory item by ID for possible deletion
router.get('/delete/:inv_id', utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventoryView))
// Route to call a controller function to carry out the delete
router.post("/delete", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.deleteInventory));

// Review routes
// KEEPING THIS ROUTE HERE AS IT'S THE ONE THE FORM IN vehicle-detail.ejs IS POINTING TO
// AND IT'S A VALID ROUTE TO HANDLE REVIEW SUBMISSION FOR A SPECIFIC INVENTORY ITEM.
router.post("/submit-review", reviewController.submitReview);


module.exports = router;