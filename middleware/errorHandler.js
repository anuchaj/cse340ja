function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(500).render("errors/500", { message: "Something went wrong!" })
}
module.exports = errorHandler
