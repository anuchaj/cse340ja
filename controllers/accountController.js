const accountModel = require("../models/account-model")
const utilities  = require("../utilities/index")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator"); // ✅ Required for validation error handling
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
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render('account/account-management', {
    title: 'Account Management',
    nav,
    accountData: res.locals.accountData,
    errors: null,
    message: res.locals.message || null,
  })
}


/* ****************************************
 *  Deliver update view
 * *************************************** */
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav()
  res.render('account/update', {
    title: 'Update Account',
    nav,
    accountData: res.locals.accountData,
    errors: null,
    message: null,
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
      return res.redirect("/account/account-management") // return res.redirect("/account/user")
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
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('account/update', {
      title: 'Update Account',
      nav,
      accountData: res.locals.accountData,
      errors: errors.array(),
      message: 'Please correct the errors below',
    })
  }

  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const existingEmail = await accountModel.getAccountByEmail(account_email)
  if (existingEmail && existingEmail.account_id != account_id) {
    return res.render('account/update', {
      title: 'Update Account',
      nav,
      accountData: res.locals.accountData,
      errors: [{ msg: 'Email already exists' }],
      message: 'Please correct the errors below',
    })
  }

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    const updatedAccount = await accountModel.getAccountById(account_id)
    const token = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3600 * 1000 })
    res.locals.accountData = updatedAccount
    res.locals.message = 'Account updated successfully'
    res.render('account/account-management', {
      title: 'Account Management',
      nav,
      accountData: updatedAccount,
      errors: null,
      message: 'Account updated successfully',
    })
  } else {
    res.render('account/update', {
      title: 'Update Account',
      nav,
      accountData: res.locals.accountData,
      errors: null,
      message: 'Update failed. Please try again.',
    })
  }
}

/* ****************************************
 *  Process Password Update
 * *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render('account/update', {
      title: 'Update Account',
      nav,
      accountData: res.locals.accountData,
      errors: errors.array(),
      message: 'Please correct the errors below',
    })
  }

  const { account_password, account_id } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    const updatedAccount = await accountModel.getAccountById(account_id)
    res.locals.message = 'Password updated successfully'
    res.render('account/account-management', {
      title: 'Account Management',
      nav,
      accountData: updatedAccount,
      errors: null,
      message: 'Password updated successfully',
    })
  } else {
    res.render('account/update', {
      title: 'Update Account',
      nav,
      accountData: res.locals.accountData,
      errors: null,
      message: 'Password update failed. Please try again.',
    })
  }
}

/* ****************************************
 *  Process Logout
 * *************************************** */
async function logout(req, res, next) {
  res.clearCookie('jwt')
  let nav = await utilities.getNav()
  res.render('index', {
    title: 'Home',
    nav,
    errors: null,
    message: 'Logged out successfully',
  })
}

module.exports = {
  buildLogin,
  buildRegister,
  buildManagement,
  buildUpdate,
  registerAccount,
  accountLogin,
  updateAccount,
  updatePassword,
  logout
}



