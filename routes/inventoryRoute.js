// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

console.log('invController.buildDetailView:', invController.buildDetailView);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by detail view
router.get("/detail/:inv_id", invController.buildDetailView);

// Trigger Intentional Error
router.get("/trigger-error", invController.triggerError);

module.exports = router;


