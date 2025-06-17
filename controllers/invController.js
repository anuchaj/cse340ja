const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator"); // ✅ Required for validation error handling


const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) {
      req.flash("error", "No vehicles found for this classification.");
      return res.redirect("/inv");
    }
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (err) {
    next(err);
  }
};

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
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      messages: req.flash(), // ✅ Displays any flash message passed
    });
  } catch (err) {
    next(err);
  }
};

/* *********************************
 *  Build view to add classification
 * ******************************* */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
    });
  } catch (err) {
    next(err);
  }
};

/* *********************************
 *  Handle classification form submission
 * ******************************* */
invCont.addClassification = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    const nav = await utilities.getNav();
    const { classification_name } = req.body;

    if (!errors.isEmpty()) {
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash(),
        errors: errors.array(),
      });
    }

    const result = await invModel.addClassification(classification_name);

    if (result) {
      req.flash("message", "New classification added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add classification.");
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash(),
      });
    }
  } catch (err) {
    next(err);
  }
};

/* *********************************
 *  Build add inventory view
 * ******************************* */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
      classification_id: "",
      messages: req.flash(),
      errors: null,
    });
  } catch (err) {
    next(err);
  }
};

/* *********************************
 *  Handle add inventory form submission
 * ******************************* */
invCont.addInventory = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);

    if (!errors.isEmpty()) {
      return res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        ...req.body, // Sticky inputs
        messages: req.flash(),
        errors: errors.array(),
      });
    }

    const result = await invModel.addInventory(req.body);

    if (result) {
      req.flash("message", "Vehicle successfully added.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add vehicle.");
      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        ...req.body,
        messages: req.flash(),
        errors: [],
      });
    }
  } catch (err) {
    next(err);
  }
};


/* *********************************************
 *  Return Inventory by Classification As JSON
 * ********************************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


// Deliver the view for editing an inventory item or Build render edit inventory view
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();

    // ✅ Fetch the inventory item
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      req.flash("error", "Inventory item not found.");
      return res.redirect("/inv");
    }

    // ✅ Build the dropdown list with the current item's classification selected
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);

    const name = `${itemData.inv_make} ${itemData.inv_model}`;

    // ✅ Send data to view
    res.render("inventory/edit-inventory", {
      title: `Edit ${name}`,
      nav,
      classificationList, // ✅ Render select list
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_year: itemData.inv_year,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
      messages: req.flash(),
      errors: null,
    });
  } catch (err) {
    next(err);
  }
};


/* *********************************************************
 *  Update Inventory Data or carry out the update proccess. 
 * ********************************************************* */
invCont.updateInventory = async function (req, res, next) {
  // Get the site navigation bar HTML
  let nav = await utilities.getNav()

  // Destructure updated vehicle data from the request body
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body


  // Safely extract a single integer classification_id
  let classification = req.body.classification_id

  if (Array.isArray(classification)) {
    classification = classification[0]
  }

  const parsedClassificationId = parseInt(classification)

  if (isNaN(parsedClassificationId)) {
    req.flash("message", "Invalid classification selected.")
    return res.redirect("back") // Or render the form with error
  }


  const parsedInvId = parseInt(inv_id)

  const updateResult = await invModel.updateInventory(
    parsedInvId,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    parsedClassificationId
  )


  // If update is successful
  if (updateResult) {
    // Create a display name for the updated item (e.g., "Toyota Camry")
    const itemName = updateResult.inv_make + " " + updateResult.inv_model

    // Flash a success message to the user
    req.flash("message", `The ${itemName} was successfully updated.`)

    // Redirect the user back to the main inventory management page
    res.redirect("/inv/")
  } else {
    // If update fails, rebuild the classification dropdown with the selected option
    const classificationSelect = await utilities.buildClassificationList(classification_id)

    // Create a display name for the item based on submitted data
    const itemName = `${inv_make} ${inv_model}`

    // Flash a failure message
    req.flash("message", "Sorry, the insert failed.")

    // Render the edit-inventory view again with the current data and classification list
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName, // Set page title
      nav, // Navigation bar HTML
      classificationList: classificationSelect, // Dropdown list
      errors: null, // No validation errors passed here
      // Refill the form with the data the user submitted
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}


//  Build/deliver delete inventory view
invCont.deleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();

    // ✅ Fetch the inventory item
    const itemData = await invModel.getVehicleById(inv_id);
    const itemName  = `${itemData.inv_make} ${itemData.inv_model}`

    if (!itemData) {
      req.flash("error", "Inventory item not found.");
      return res.redirect("/inv");
    }

    // ✅ Send data to view
    res.render("inventory/delete-confirm", {
      title: `Delete ${itemName }`,
      nav,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_price: itemData.inv_price,
      inv_year: itemData.inv_year,
      classification_id: itemData.classification_id,
      errors: null
    });
  } catch (err) {
    next(err);
  }
};


/* *********************************************************
 *  Deletion is being carried out 
 * ********************************************************* */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year,
    classification_id,
  } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id)

  const itemName = `${inv_make} ${inv_model}`

  if (deleteResult > 0) {
    req.flash("message", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    req.flash("message", `Sorry, the deletion of ${itemName} failed.`)
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      message: req.flash("message"),
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      classification_id,
    })
  }
}



/* *********************************
 * Trigger intentional error for testing
 * ******************************* */
invCont.triggerError = function (req, res, next) {
  throw new Error("Intentional server error for testing.");
};

module.exports = invCont;
