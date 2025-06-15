const accountModel = require("../models/account-model")
const utilities  = require("../utilities/index")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  req.flash("message", "Please fill the form to login.")
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash("message") || null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message: req.flash("message")[0] || null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav()
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body

      // Hash the password before storing
    let hashedPassword
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("message", 'Sorry, there was an error processing the registration.')
      res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        message: req.flash("message")[0] || null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      // ✅ Use the same key to set and get the flash message
      req.flash(
        "message",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      // ✅ Redirect instead of render
      return res.redirect("/account/login")
    } else {
      req.flash("message", "Sorry, the registration failed.")
      return res.status(500).render("account/register", {
        title: "Register",
        nav,
        message: req.flash("message")[0] || null,
        errors: null,
      })
    }
  } catch (error) {
    console.error("Registration Error:", error)
    return next(error) // ✅ Let Express handle the crash
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("message", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      message: req.flash("message") || null,
      // message: req.flash("message")[0] || null,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account") // return res.redirect("/account/user")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver user account view
* *************************************** */
/*
async function userAccount(req, res, next) {
  let nav = await utilities.getNav()
  req.flash("message", "Welcome to your Dashboard!.")
  res.render("account/user", {
    title: "My Account",
    nav,
    errors: null,
    message: req.flash("message") || null
  })
}
*/

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  try {
      let nav = await utilities.getNav()
      req.flash("notice", "Welcome to Account management view.")
      res.render("account/account-management", {
        title: "Account Management",
        nav,
        // errors: null,
        message: req.flash("notice") // || null
      });
    } catch (err) {
      next(err);
    }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement }


