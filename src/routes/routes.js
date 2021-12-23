const constVar = require('./config/constants');
let url = constVar.url;
let myGlobalVar = {};
let MongoClient = require('mongodb').MongoClient;
const express = require("express");
let router = express.Router();

//route for login action
router
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })

  .post((req, res) => {
    myGlobalVar.eEmail = req.body.email;
    myGlobalVar.ePass = req.body.password;
     
    MongoClient.connect(url, function(err, db) {
         if (err) {
                  alert("Db Connection error");
              };
        let query = { Email: myGlobalVar.eEmail, Password: myGlobalVar.ePass, isActive:1};
        let dbo = db.db("expense_manager"); 
        //Verifying user authentication
        dbo.collection("users").find(query).toArray(function(err, result){
             if (err) {
                  alert("Db Connection error");
              };
            console.log(result);

            myGlobalVar.aEmail = result[0].Email;
            myGlobalVar.aPass = result[0].Password;
            myGlobalVar.name = result[0].FullName;
            myGlobalVar.id = result[0]._id;
            id = result[0]._id;
            req.session.userId = id;

            data = {
                aPass : myGlobalVar.aPass,
                ePass : myGlobalVar.ePass,
                eEmail : myGlobalVar.eEmail,
                name : myGlobalVar.name,
                id : myGlobalVar.id};

            res.render("homepage", {data : data});
            db.close();
        });
    });
});
  
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

  .post((req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    console.log(name,email,password); 
    res.render("signup");
  
    MongoClient.connect(url, function(err, db) 
    {
         if (err) {
                  alert("Db Connection error");
              };
        let myobj = { FullName: name, 
            Email: email, 
            Password: password, 
            isActive:1 }; 
        let dbo = db.db("expense_manager"); 
        dbo.collection("users").insertOne(myobj, function(err, res) 
        {
             if (err) {
                  alert("Db Connection error");
              };
            console.log("data inserted in Users collection");
            data = {
                name : name,
                key : 1};
            res.render("homepage", {data : data});
            db.close();
        });
    });
});
 
//route for create account action
  router
  .route("/account")
  .get((req, res) => {
    let query = require('url').parse(req.url,true).query;
    let id = query.id;
    console.log(id);
  
    MongoClient.connect(url, function(err, db) {
         if (err) {
                  alert("Db Connection error");
              };
        var dbo = db.db("expense_manager");
        dbo.collection("users").find({}, { projection: { FullName: 1 } }).toArray(function(err, result) {
             if (err) {
                  alert("Db Connection error");
              };
            console.log(result);
            let names = new Array();
            for (let i = 0; i < result.length; i++) {
                names[i] = result[i].FullName;
            }
            res.render("account", {names : names});
            db.close();
        });
    });
})
  
  .post((req, res) => {
    let members = req.body.memNames;
    let AccName = req.body.AccName;
    let personal = req.body.personal;
    console.log(members,AccName,personal)
    console.log(req.body);
  
    MongoClient.connect(url, function(err, db) {
         if (err) {
                  alert("Db Connection error");
              };
        var dbo = db.db("expense_manager");
    
        myObj = { AccName: AccName, 
                Balance : 0, 
                Admin : req.session.userId};
    
        if(personal == 0){
            myObj.Members = members, 
            myObj.Personal = 0;
        }
        else{
            myObj.Income = income;
            myObj.Personal = 1;
        }
        
        dbo.collection("Accounts").insertOne(myobj, function(err, res) 
        {
             if (err) {
                  alert("Db Connection error");
              };
            console.log("data inserted into Accounts collection");
            db.close();
        });
    });
});

  //route for manage account action
  router
  .route("/manageacc")
  .get((req, res) => {
    MongoClient.connect(url, function(err, db) 
    {
         if (err) {
                  alert("Db Connection error");
              };
        let dbo = db.db("expense_manager");
        dbo.collection("Accounts").find({}).toArray(function(err, result) 
        {
             if (err) {
                  alert("Db Connection error");
              };
            console.log(result);

            let names = new Array();
            for (let i = 0; i < result.length; i++) {
                names[i] = result[i].AccName;
            }
        let uId = req.session.userId;
        console.log(names)
        res.render("manageacc", { ans : result , uId : uId });
        db.close();
        });
    });
});

//route for settings action
router
  .route("/settings")
  .get((req, res) => {
    let query = require('url').parse(req.url,true).query;
    req.session.AccName = query.acname;
    req.session.auId = query.id;
    let aId = query.acid;
    req.session.aId = aId;
  
    console.log(req.session.AccName);
    res.render("settings");
  })

  .post((req, res) => {
    console.log(req.body);

    MongoClient.connect(url, function(err, db) {
       if (err) {
                  alert("Db Connection error");
              };
      var dbo = db.db("expense_manager");
    
      if(req.body.chAccName == 1 && req.body.nAccname != '') {
        var myquery = { AccName: req.session.AccName , Admin : req.session.auId}; 
        var newvalues = { $set: { AccName: req.body.nAccname } };}
    
      if(req.body.addMember == 1 && req.body.nMember != '') {
        var myquery = { AccName: req.session.AccName , Admin : req.session.auId}; 
        var newvalues = { $push: { Members: req.body.nMember } };}
      
      if(req.body.rmMember == 1 && req.body.rMember != '') {
        var myquery = { AccName: req.session.AccName , Admin : req.session.auId}; 
        var newvalues = { $pull: { Members: req.body.rMember } };}
    
      if(req.body.delAcc == 1 && req.body.dAccount != '') {
        var myquery = { AccName: req.session.AccName}; 
        dbo.collection("Accounts").deleteOne(myquery, function(err, obj) {
           if (err) {
                  alert("Db Connection error");
              };
          console.log("Account Deleted");
          db.close();
        });
     }
    
      dbo.collection("Accounts").updateOne(myquery, newvalues, function(err, res) {
         if (err) {
                  alert("Db Connection error");
              };
        console.log("Account Updated");
        db.close();
        });
    });
});

//route for transactions action
router
  .route("/transaction")
  .get((req, res) => {
    res.render("transactions");
  })

  .post((req, res) => {
    console.log(req.body);

    MongoClient.connect(url, function(err, db) 
    {
         if (err) {
                  alert("Db Connection error");
              };
        let dbo = db.db("expense_manager");
        /* let query = { _id: req.session.aId};
        dbo.collection("Accounts").find(query).toArray(function(err, result){
            if (err) {
                 alert("Db Connection error");
             };
           console.log(result);
           req.session.actAmount = result[0].Balance;
           //db.close();
       }); */
        
        myObj = {  account_name : req.body.accountName, 
                   uId: req.session.userId, 
                   acc_id: req.session.aId, 
                   Amount : req.body.amount, 
                   Desc : req.body.desc, 
                   Timestamp : new Date().getTime()};

        if(req.body.income == 1){
            myObj.Transaction_Type = 'Income';   
            myObj.Category = req.body.incomeCat;
        }
        else{
            myObj.Transaction_Type = 'Expense'; 
            myObj.Category = req.body.expenseCat;
        }

        //inserting data in Transactions collection
        dbo.collection("Transactions").insertOne(myObj, function(err, res){
            if (err) {
                alert("Db Connection error");
            };
        console.log("data inserted in Tranasactions collection");
        db.close();
        });
    });
});

//route for logout action
router
  .route("/logout")
  .get((req, res) => {
    req.session.destroy();
    req.session = null
    res.redirect("homepage");
  });


module.exports = router;



