const jwt = require("jsonwebtoken")
const { body, validationResult } = require('express-validator')
require("dotenv").config()
const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
* Build the classification List view HTML
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected"
    }
    classificationList += `>${row.classification_name}</option>`
  })
  classificationList += "</select>"
  return classificationList
}


/* ************************
 * Constructs the vehicles detail view
 ************************** */
Util.buildVehicleDetail = function (vehicle) {
  let dollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(vehicle.inv_price);

  let mileage = vehicle.inv_miles.toLocaleString();

  return `
  <section class="vehicle-detail">
    <div class="vehicle-image">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
    </div>
    <div class="vehicle-info">
      <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <p><strong>Price:</strong> ${dollar}</p>
      <p><strong>Mileage:</strong> ${mileage}</p>
      <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      <p>${vehicle.inv_description}</p>
    </div>
  </section>`;
}


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }


 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


// Middleware to check JWT and account type
Util.checkEmployeeOrAdmin = async function (req, res, next) {
  const token = req.cookies.jwt
  console.log('JWT Token:', token) // Debug: Log the token
  if (!token) {
    let nav = await Util.getNav(req, res, next) // Get navigation
    res.locals.message = 'Please log in with an Employee or Admin account'
    return res.render('account/login', {
      title: 'Login', // Add title
      nav, // Add nav
      errors: null,
      message: res.locals.message
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (decoded.account_type === 'Employee' || decoded.account_type === 'Admin') {
      next()
    } else {
      let nav = await Util.getNav(req, res, next) // Get navigation
      res.locals.message = 'Access restricted to Employee or Admin accounts'
      res.render('account/login', {
        title: 'Login', // Add title
        nav, // Add nav
        errors: null,
        message: res.locals.message
      })
    }
  } catch (err) {
    let nav = await Util.getNav(req, res, next) // Get navigation
    res.locals.message = 'Invalid or expired session'
    res.render('account/login', {
      title: 'Login', // Add title
      nav, // Add nav
      errors: null,
      message: res.locals.message
    })
  }
}

// Validation middleware for account update
Util.validateAccountUpdate = [
  body('account_firstname').trim().notEmpty().withMessage('First name is required'),
  body('account_lastname').trim().notEmpty().withMessage('Last name is required'),
  body('account_email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
]

// Validation middleware for password change
Util.validatePasswordChange = [
  body('account_password')
    .trim()
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain a special character'),
]


 // Handle errors
//function handleErrors(fn) {
//  return function (req, res, next) {
//    Promise.resolve(fn(req, res, next)).catch(next)
//  }
//}

 /* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util

//module.exports = { buildVehicleDetail, other functions to be exported };


