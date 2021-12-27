//import { postLogin as postLogin, postSignup as postSignup, getLogout as getLogout, getCreateAccount as getCreateAccount, postCreateAccount as postCreateAccount, getSettings as getSettings, postSettings as postSettings, postTransactions as postTransactions, getManageAccount as getManageAccount } from '../controllers/controllerAuth';
const controller = require('../controllers/controllerAuth');
let postLogin = controller.postLogin;
let postSignup = controller.postSignup;
let getLogout = controller.getLogout;
let getCreateAccount = controller.getCreateAccount;
let postCreateAccount = controller.postCreateAccount;
let getSettings = controller.getSettings;
let postSettings = controller.postSettings;
let postTransactions = controller.postTransactions;
let getManageAccount = controller.getManageAccount;
const express = require("express");
let router = express.Router();

//route for login action
router
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(postLogin);
  
//route for homepage action
  router
  .route("/homepage")
  .get((req, res) => {
    var data = {
        aPass : null,
        ePass : null,
        eEmail : null,
        name : null};
    res.render("homepage", {data : data});
  });

//route for signup action
  router
  .route("/signup")
  .get((req, res) => {
    res.render("signup");
  })
  .post(postSignup);
 
//route for create account action
  router
  .route("/account")
  .get(getCreateAccount)
  .post(postCreateAccount);

  //route for manage account action
  router
  .route("/manageacc")
  .get(getManageAccount);

//route for settings action
router
  .route("/settings")
  .get(getSettings)
  .post(postSettings);

//route for transactions action
router
  .route("/transaction")
  .get((req, res) => {
    res.render("transactions");
  })
  .post(postTransactions);

//route for logout action
router
  .route("/logout")
  .get(getLogout);

module.exports = router;
