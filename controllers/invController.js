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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


// Deliver the view for editing an inventory item
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const invId = req.params.inv_id;

    // This typically fetches the inventory item from my model/database
    const inventoryData = await invModel.getVehicleById(invId); // this function should exist in inventory model.

    if (!inventoryData) {
      return res.status(404).send("Inventory item not found");
    }

    res.render("inventory/edit-inventory", {
      title: `Edit ${inventoryData.inv_make} ${inventoryData.inv_model}`,
      inventory: inventoryData,
    });
  } catch (error) {
    next(error);
  }
}


/* *********************************
 *  Build edit inventory view
 * ******************************* */
invCont.editInventoryView = async function (req, res, next) {
  try {
    // const inv_id = parseInt(req.params.inv_id);
    const inv_id = parseInt(req.params.inv_id, 10);

    const nav = await utilities.getNav();

    // Fetch the single inventory item by inv_id
    const itemData = await invModel.getVehicleById(inv_id);

    console.log(itemData);

    if (!itemData) {
      // Item not found, handle accordingly
      req.flash("error", "Inventory item not found.");
      return res.redirect("/inv/management");
    }

    // Build classification list dropdown HTML, with current classification selected
    const classificationList = await utilities.buildClassificationList(itemData.classification_id);

    const name = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/edit-inventory", {
      title: `Edit ${name}`,
      nav,
      classificationList, // <-- Pass this to EJS to render dropdown
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



invCont.updateInventory = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);

    if (!errors.isEmpty()) {
      return res.render("inventory/edit-inventory", {
        title: "Edit Vehicle",
        nav,
        classificationList,
        ...req.body,
        messages: req.flash(),
        errors: errors.array(),
      });
    }

    const result = await invModel.updateInventory(req.body);

    if (result) {
      req.flash("success", "Vehicle updated successfully.");
      return res.redirect("/inv");
    } else {
      req.flash("error", "Failed to update vehicle.");
      return res.render("inventory/edit-inventory", {
        title: "Edit Vehicle",
        nav,
        classificationList,
        ...req.body,
        messages: req.flash(),
        errors: [],
      });
    }
  } catch (error) {
    next(error);
  }
};



/* *********************************
 * Trigger intentional error for testing
 * ******************************* */
invCont.triggerError = function (req, res, next) {
  throw new Error("Intentional server error for testing.");
};

module.exports = invCont;



/* ***************************
 *  Build edit inventory view
 * ************************** */
/*
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryById(inv_id)
  
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}
  */