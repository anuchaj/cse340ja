// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const { validateAccountUpdate, validatePasswordChange } = require('../utilities')


// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// GET Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Route to build management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

// Route to build management view
router.get('/account-management', utilities.checkJWTToken, accountController.buildManagement)

router.get('/update/:accountId', utilities.checkJWTToken, accountController.buildUpdate)
router.post('/update/:accountId', utilities.checkJWTToken, validateAccountUpdate, accountController.updateAccount)
router.post('/update-password/:accountId', utilities.checkJWTToken, validatePasswordChange, accountController.updatePassword)
router.get('/logout', accountController.logout)




module.exports = router

