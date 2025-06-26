/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const reviewRoute = require("./routes/reviewRoute")
const utilities = require("./utilities/index")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")
const flash = require('connect-flash');
const errorHandler = require("./middleware/errorHandler")
const cookieParser = require("cookie-parser")


/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(flash())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(errorHandler)
app.use(cookieParser())

app.use(utilities.checkJWTToken)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
// app.set('views', './views'); // JUST ADDED 
app.use(expressLayouts)
app.set("layout", "layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route *** Main route with error handler
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// Review routes
// app.use("/review", reviewRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  let nav = await utilities.getNav();
  res.status(404).render("errors/error", {
    title: "Page Not Found",
    message: "Sorry, the page you are looking for does not exist.",
    nav,
  });
});

/* ***********************
* Express Error Handler Middleware
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  console.error(err.stack)
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  const message = err.status === 500 ? err.message : "Oh no! There was a crash. Maybe try a different route?"
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav
  })
})

/* ************************************
 * Local Server Information
 * Values from .env (environment) file
 ***************************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})
