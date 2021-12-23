//importing dependencies
const express = require("express");
const app = express();
let path = require("path");
let routes = require("./routes/routes");
let session = require('express-session');
let cookieParser = require('cookie-parser');

//creating cookie session
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

//middleware mounting
app.use(express.json()); 
app.use(express.urlencoded());
app.use('/', routes);
app.set('views', path.join(__dirname, 'views'));

//EJS Template
app.set('view engine','ejs');

//Starting the server at port 3000
app.listen(3000, function() { 
  console.log('Server running on port 3000'); 
});