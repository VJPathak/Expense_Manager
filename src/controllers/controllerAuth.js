const constVar = require('../config/constants');
let url = constVar.dbUrl;
let MongoClient = require('mongodb').MongoClient;

const postLogin = (req, res) => {
    MongoClient.connect(url, function(err, db) {
         if (err) {
                  alert("Db Connection error");
              };
        let query = { Email: req.body.email, Password: req.body.password, isActive:1};
        let dbo = db.db("expense_manager"); 
        //Verifying user authentication
        dbo.collection("users").find(query).toArray(function(err, result){
             if (err) {
                  alert("Db Connection error");
              };
            console.log(result);
            let name = result[0].FullName;
            let id = result[0]._id;
            id = result[0]._id;
            req.session.userId = id;

            data = {
                name : name,
                id : id};

            res.render("homepage", {data : data});
            db.close();
        });
    });
};

const postSignup = (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    console.log(name,email,password); 
  
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
}; 

const getLogout = (req, res) => {
    req.session.destroy();
    req.session = null
    res.redirect("homepage");
}; 

const getCreateAccount = (req, res) => {
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
}; 

const postCreateAccount = (req, res) => {
    let members = req.body.memNames;
    let accountName = req.body.accountName;
    let personal = req.body.personal;
    console.log(members,accountName,personal)
    console.log(req.body);
  
    MongoClient.connect(url, function(err, db) {
         if (err) {
                  alert("Db Connection error");
              };
        var dbo = db.db("expense_manager");

        myObj = { AccName: accountName, 
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
}; 

const getSettings = (req, res) => {
    let query = require('url').parse(req.url,true).query;
    req.session.AccName = query.acname;
    req.session.auId = query.id;
    let accountId = query.acid;
    req.session.aId = accountId;
    console.log(req.session.AccName);
    res.render("settings");
}; 

const postSettings = (req, res) => {
    console.log(req.body);

    MongoClient.connect(url, function(err, db) {
       if (err) {
                  alert("Db Connection error");
              };
      var dbo = db.db("expense_manager");
    
      if(req.body.changeAccountFlag == 1 && req.body.newAccountName != '') {
        var myquery = { AccName: req.session.AccName , Admin : req.session.auId}; 
        var newvalues = { $set: { AccName: req.body.newAccountName } };}
    
      if(req.body.addMemberFlag == 1 && req.body.newMember != '') {
        var myquery = { AccName: req.session.AccName , Admin : req.session.auId}; 
        var newvalues = { $push: { Members: req.body.newMember } };}
      
      if(req.body.removeMemberFlag == 1 && req.body.removeMember != '') {
        var myquery = { AccName: req.session.AccName , Admin : req.session.auId}; 
        var newvalues = { $pull: { Members: req.body.removeMember } };}
    
      if(req.body.deleteAccountFlag == 1 && req.body.deleteAccount != '') {
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
}; 

const postTransactions = (req, res) => {
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

                   switch(myObj.Transaction_Type) {
                    case 1:
                        myObj.Transaction_Type = 'Income';   
                        myObj.Category = req.body.incomeCat;
                      break;
                    case 2:
                        myObj.Transaction_Type = 'Expense'; 
                        myObj.Category = req.body.expenseCat;
                      break;
                    default:
                      alert("Unable to proceed information at a moment");
                      var flag = 0;
                  }

                    //exception handling
                    if(flag!= 0){
                        //inserting data in Transactions collection
                        dbo.collection("Transactions").insertOne(myObj, function(err, res){
                        if (err) {
                            alert("Db Connection error");
                        };
                        console.log("data inserted in Tranasactions collection");
                        db.close();
                        });
                    }
                    else{
                        alert("Unable to proceed information at a moment");
                    }
    });
}; 

const getManageAccount = (req, res) => {
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
};

module.exports = {postLogin, postSignup, getLogout, getCreateAccount, postCreateAccount, getSettings, postSettings, postTransactions, getManageAccount};