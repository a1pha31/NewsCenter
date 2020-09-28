const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const path = require('path');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/",(req,res)=>{
  res.render("login");
})

app.use(session({
  secret: 'max',
  resave: false,
  saveUninitialized: true,
}));
//database connection

const sql = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'vibhav',
  database : 'newsletter',
  multipleStatements : true
})

sql.connect((err)=>{
  if(!err){
    console.log("Connection established successfully.");
  }
  else{
    console.log("Connection failed.");
  }
})

var list =[] ;


app.get("/home",(req,res)=>{
  //console.log(req.session);
  if(req.session.username){

    sql.query('SELECT * FROM news',(err,results,fields)=>{
      if(err) throw err;
      list= results;
      //console.log(list);
      console.log(req.session.username);
      res.render('home',{
        name: req.session.name,
        list : list

      })
    });
  }
  else{
    res.redirect('/');
  }

  //console.log(list);

})

app.post("/login",(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;
  //console.log(username+"  "+password);
  if(username && password){
    sql.query('SELECT * FROM login WHERE username = ? AND password= ?', [username, password], function(error,results,fields){
      if(results.length>0){
        //console.log(results[0].name);
        req.session.username = username;
        req.session.name = results[0].name;
        res.redirect('/home');
      }
      else{
        res.redirect('/');
      }
    });
  }

  //res.redirect('/home');
  // res.send("Username : " +username );
});



app.get("/adminSignin",(req,res)=>{
  res.render("adminSignin");
})

app.post("/adminLogin",(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;
  //console.log(username + "  " + password);
  if(username && password){
    sql.query('SELECT * FROM admin WHERE username = ? AND password= ?', [username, password], function(error,results,fields){
      if(results.length>0){
        req.session.username = username;
        //req.session.name = results[0].name;
        res.redirect('/adminHome');
      }
      else{
        res.redirect('/adminSignin');
      }
      res.end();
    });
  }

  //res.redirect("/adminHome");
})

app.get("/adminHome",(req,res)=>{
  //console.log(req.session.username);
  if(req.session.username){
    sql.query('SELECT * FROM news',(err,results,fields)=>{
      if(err) throw err;
      list= results;
      //console.log(req.session.name);
      res.render("adminHome",{
        name : req.session.username,
        list:list
      });
    });
  }
  else{
    res.redirect('/');
  }
});

app.get('/addNew',(req,res)=>{
  if(req.session.username){
    res.render('adminNewNews');
  }
  else{
    res.redirect('/');
  }
})

app.post('/addNewNews',(req,res)=>{
  var title = req.body.title;
  var content = req.body.content;
  var date = JSON.stringify(new Date()).substring(1,11);
  //console.log(date);
  if(title && content){
    sql.query('INSERT INTO news (title,content, date) VALUES (?,?,?)',[title,content,date], function(error,results,fields){
      if(error) throw error;
      //console.log(results.affectedRows);
      res.redirect("/adminHome");
      res.end();
    })
  }
  //res.send(date);
})

app.get("/news/:topic",(req,res)=>{
  //console.log(req.params.topic);
  if(req.session.username){
    const titleReq = lodash.lowerCase(req.params.topic);
    let newsTitle ="";
    let newsDate = "";
    let newsContent = "";
    list.forEach((i)=>{
      const stTitle = lodash.lowerCase(i.title);
      if(stTitle === titleReq){
        newsTitle = i.title;
        newsDate = i.date;
        newsContent = i.content;
      }
    });
    res.render("news",{
      newsTitle : newsTitle,
      newsContent: newsContent,
      newsDate: newsDate
    });
  }
  else{
    res.redirect('/');
  }

})

app.get("/adminNews/:topic",(req,res)=>{
  //console.log(req.params.topic);
  if(req.session.username){
    const titleReq = lodash.lowerCase(req.params.topic);
    let newsTitle ="";
    let newsDate = "";
    let newsContent = "";
    list.forEach((i)=>{
      const stTitle = lodash.lowerCase(i.title);
      if(stTitle === titleReq){
        newsTitle = i.title;
        newsDate = i.date;
        newsContent = i.content;
      }
    });
    res.render("adminNews",{
      newsTitle : newsTitle,
      newsContent: newsContent,
      newsDate: newsDate
    });
  }
  else{
    res.redirect('/');
  }

})


app.post("/signup",(req,res)=>{
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  // res.send("Username : " +username + " Name : " + name + " Email : " + email);
  if(username && password){
    sql.query('INSERT INTO login (username,name, password,email) VALUES (?,?,?,?)',[username,name,password,email], function(error,results,fields){
      if(error) throw error;
      req.session.username = username;
      req.session.name = name;
      console.log(results.affectedRows);
      res.redirect("/home");
      res.end();
    })
  }
//  res.redirect("/home");
});

app.get("/logout",(req,res,next)=>{
  req.session.destroy();
  res.redirect('back');
})


































app.listen(3000, (req,res)=>{
  console.log("Server is live at port 3000");
})
































// var emailFrom = `a1pha31mails@gmail.com`;
//
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: emailFrom,
//     pass: `gmail_3105`
//   }
// })

// if(req.body.sendEmail === 'yes'){
//   var emailList = '';
//   sql.query('SELECT email from login',function(err,res,fiel){
//     res.forEach((i) => {
//       emailList = emailList + "," +i.email;
//     });
//     //console.log(JSON.stringify(emailList.substring(1)));
//     let mailOptions = {
//       from: emailFrom,
//       to: emailList,
//       subject: title,
//       text: content
//     };
//
//     //send email
//     transporter.sendMail(mailOptions,(err,respose)=>{
//       if(err) throw err;
//       console.log(respose);
//       //res.send("Email has been sent successfully!!")
//     })
//
//   });
// }
