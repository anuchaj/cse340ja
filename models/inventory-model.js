const pool = require("../database/");

const invModel = {};

/* ***************************
 *  Get all classification data
 * ************************** */
invModel.getClassifications = async function () {
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
    return data;
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
};

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
};


/* ***************************
 *  Get a single vehicle by ID
 * ************************** */
invModel.getVehicleById = async function (inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE inv_id = $1`,
      [inv_id]
    );
    console.log("DB query result rows:", data.rows); // add this to debug
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error:", error);
    throw error;
  }
};

/* ***************************
 *  Add a new classification
 * ************************** */
invModel.addClassification = async function (classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount; // > 0 if successful
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
};

/* ***************************
 *  Add a new inventory item
 * ************************** */
invModel.addInventory = async function (inventoryData) {
  try {
    const {
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
    } = inventoryData;

    const sql = `INSERT INTO public.inventory 
      (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, 
       inv_price, inv_year, inv_miles, inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

    const result = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    ]);

    return result.rowCount; // > 0 if successful
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
};


/* ***************************
 *  Update inventory item
 * ************************** */
invModel.updateInventory = async function (inventoryData) {
  try {
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
    } = inventoryData;

    const sql = `UPDATE public.inventory SET
      inv_make = $1,
      inv_model = $2,
      inv_description = $3,
      inv_image = $4,
      inv_thumbnail = $5,
      inv_price = $6,
      inv_year = $7,
      inv_miles = $8,
      inv_color = $9,
      classification_id = $10
      WHERE inv_id = $11
    `;

    const result = await pool.query(sql, [
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
      inv_id,
    ]);

    return result.rowCount; // > 0 if update was successful
  } catch (error) {
    console.error("updateInventory error:", error);
    throw error;
  }
};



module.exports = invModel;
