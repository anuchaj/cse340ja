function validateClassification(req, res, next) {
  const { classification_name } = req.body;
  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(classification_name)) {
    return res.render('inventory/add-classification', { errorMessage: 'Invalid classification name.' });
  }
  next();
}


function validateInventory(req, res, next) {
  const { inv_make, classification_id } = req.body;
  if (!inv_make || !classification_id) {
    return res.render('inventory/add-item', { errorMessage: 'All fields are required.' });
  }
  next();
}
