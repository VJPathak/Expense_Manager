/* //importing dependencies
const express = require("express")
const app = express();
var myGlobalVar = {};
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.use(express.json()); 
app.use(express.urlencoded());

app.set('view engine','ejs');
  
//rendering login.ejs
 app.get('/logout',function(req,res){
   req.session.destroy();
   req.session = null

  res.redirect("homepage");
}); 

//rendering report.ejs
app.get('/report',function(req,res){

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("expense_manager");
    dbo.collection("Transactions").find({}, { projection: { account_name: 1, uid : 1, acc_id :1, Transaction_Type :1, Category : 1, Amount : 1, Desc : 1, Timestamp : 1} }).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      
      //console.log(result[0]._id);
      res.render("report", { result : result });
      db.close();
    });
  });
}); 

app.post('/report', function(req,res)
{
//console.log(req.body);
});


//rendering transactions.ejs
app.get('/transactions',function(req,res){

 res.render("transactions");
}); 

app.post('/transactions',function(req,res){

  console.log(req.body);

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";
  MongoClient.connect(url, function(err, db) 
  {
    if (err) throw err;
    var dbo = db.db("expense_manager");

    if(req.body.income == 1){
      var myobj = { account_name : req.body.accname, uid: req.session.userid, acc_id: req.session.aid, Transaction_Type : 'Income', Category : req.body.in_cat , Amount : req.body.amount, Desc : req.body.desc, Timestamp : new Date().getTime()};
    }
    if(req.body.expense == 1){
      var myobj = { account_name : req.body.accname, uid: req.session.userid, acc_id: req.session.aid, Transaction_Type : 'Expense', Category : req.body.exp_cat , Amount : req.body.amount, Desc : req.body.desc, Timestamp : new Date().getTime()};
    }
  
    dbo.collection("Transactions").insertOne(myobj, function(err, res) 
    {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });

 }); 

app.get('/settings',function(req,res){
  var query = require('url').parse(req.url,true).query;

  var accName = query.acname;
  req.session.accName = accName;
  var auid = query.id;
  req.session.auid = auid;
  var aid = query.acid;
  req.session.aid = aid;

  console.log(req.session.accName);
  res.render("settings");
}); 

app.post('/settings', function(req,res)
{
console.log(req.body);

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("expense_manager");

  if(req.body.ck1 == 1 && req.body.nacname != '') {
    var myquery = { accName: req.session.accName , Admin : req.session.auid}; 
    var newvalues = { $set: { accName: req.body.nacname } };}

  if(req.body.ck2 == 1 && req.body.nmember != '') {
    var myquery = { accName: req.session.accName , Admin : req.session.auid}; 
    var newvalues = { $push: { Members: req.body.nmember } };}
  
  if(req.body.ck3 == 1 && req.body.rmember != '') {
    var myquery = { accName: req.session.accName , Admin : req.session.auid}; 
    var newvalues = { $pull: { Members: req.body.rmember } };}

  if(req.body.ck4 == 1 && req.body.daccount != '') {
    var myquery = { accName: req.session.accName}; 
    dbo.collection("Accounts").deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      console.log("Account Deleted");
      db.close();
    });
 }

  dbo.collection("Accounts").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("Account Updated");
    db.close();
    
  });
});

//res.render("homepage");

}); 


app.get('/manageacc', function(req,res){
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";

  MongoClient.connect(url, function(err, db) 
  {
    if (err) throw err;
    var dbo = db.db("expense_manager");
    //var query = { };
    dbo.collection("Accounts").find({}).toArray(function(err, result) 
    {
      if (err) throw err;
      console.log(result);

      let names = new Array();
      for (let i = 0; i < result.length; i++) {
        names[i] = result[i].accName;
      }
      var uid = req.session.userid;

      console.log(names)
      res.render("manageacc", { ans : result , uid : uid });

      db.close();
    });
  });
});

//rendering account.ejs
app.get('/account',function(req,res){
  var query = require('url').parse(req.url,true).query;
  var id = query.id;
  console.log(id);

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";
  
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("expense_manager");
    dbo.collection("users").find({}, { projection: { FullName: 1 } }).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      let names = new Array();
      for (let i = 0; i < result.length; i++) {
        names[i] = result[i].FullName;
      }
      console.log(names);
      console.log(req.session);
      console.log(req.session.userid);
    //}
      res.render("account", {names : names});
      db.close();
    });
  });
}); 


app.post('/account', function(req,res){
  let Members = req.body.selnames;
  let accName = req.body.acname;
  let Personal = req.body.Personal;
  console.log(Members,accName,Personal)
  console.log(req.body);

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";
  MongoClient.connect(url, function(err, db) 
  {
    if (err) throw err;
    var dbo = db.db("expense_manager");

    if(Personal == 0){
      var myobj = { accName: accName, Members : Members, Admin : req.session.userid , Personal : 0, Balance : 0};
    }
    else{
      var myobj = { accName: accName, Income : income, Balance : 0, Personal : 1, Admin : req.session.userid};
    }
  
    dbo.collection("Accounts").insertOne(myobj, function(err, res) 
    {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });


});

//rendering homepage.ejs
app.get('/homepage',function(req,res){
  //if(data == undefined){
    var data = {
      aPass : null,
      ePass : null,
      eEmail : null,
      name : null};
  res.render("homepage", {data : data});
}); 
app.post('/homepage', function(req,res){
  res.render("homepage");
});

//rendering signup.ejs
app.get('/signup',function(req,res){
  res.render("signup");
}); 
app.post('/signup', function(req,res)
{

  //console.log(req.body);
  let name = req.body.name;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  console.log(name,email,username,password); 
  res.render("signup");

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";
  MongoClient.connect(url, function(err, db) 
  {
    if (err) throw err;
    var dbo = db.db("expense_manager");
    var myobj = { FullName: name , Email: email , Password: password, isActive:1 };  
    dbo.collection("users").insertOne(myobj, function(err, res) 
    {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });

});

//rendering homepage.ejs
app.get('/login',function(req,res){
  res.render("login");
}); 
app.post('/login', function(req,res){

  myGlobalVar.eEmail = req.body.email;
  myGlobalVar.ePass = req.body.password;
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://vjpmongodb:vjpmongodb@cluster0.pakwt.mongodb.net/expense_manager?retryWrites=true&w=majority";

  MongoClient.connect(url, function(err, db) 
  {
    if (err) throw err;
    var dbo = db.db("expense_manager");
    var query = { Email: myGlobalVar.eEmail , Password: myGlobalVar.ePass,isActive:1};
    dbo.collection("users").find(query).toArray(function(err, result) 
    {
      if (err) throw err;
      console.log(result);

      myGlobalVar.aEmail = result[0].Email;
      myGlobalVar.aPass = result[0].Password;
      myGlobalVar.name = result[0].FullName;
      myGlobalVarr.id = result[0]._id;
      id = result[0]._id;
      req.session.userid = id;

      var data = {
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
  
// Starting the server at port 3000
app.listen(3000, function() { 
    console.log('Server running on port 3000'); 
}); */