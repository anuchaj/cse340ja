const pool = require("../database");

const reviewModel = {};

reviewModel.getReviewsByInventoryId = async function (inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.reviews AS r 
       JOIN public.inventory AS i 
       ON i.inv_id = r.inv_id
       WHERE i.inv_id = $1 ORDER BY created_at DESC`,
      [inv_id]
    );
    console.log("DB query result rows:", data.rows); // add this to debug
    return data.rows;
  } catch (error) {
    console.error("getReviewsByInventoryId error: ", error);
    throw error;
  }
};


reviewModel.addReview = async function (inv_id, user_name, rating, comment) {
  try {
    const data = await pool.query(
      `INSERT INTO public.reviews (inv_id, user_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
      [inv_id, user_name, rating, comment]
    );
    return data.rowCount; // > 0 if successful //return data.rows[0];
  } catch (error) {
    console.error("addReview error: ", error);
    throw error;
  }
};

module.exports = reviewModel;