const accountModel = require("../models/account-model")
const utilities  = require("../utilities/index")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
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
    message: req.flash("message") || null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav()
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
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
        message: req.flash("message"),
        errors: null,
      })
    }
  } catch (error) {
    console.error("Registration Error:", error)
    return next(error) // ✅ Let Express handle the crash
  }
}


module.exports = { buildLogin, buildRegister, registerAccount }


