
// Just added
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  try {
    res.status(500).render('errors/500', { error: err.message });
  } catch (renderErr) {
    res.status(500).send('500 - Server Error: ' + err.message); // Fallback if template is missing
  }
};


module.exports = errorHandler;



/* 
function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(500).render("errors/500", { message: "Something went wrong!" })
}
module.exports = errorHandler


*/