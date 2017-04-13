  const express = require("express");
  const app = express();
  const PORT = process.env.PORT || 8080; // default port 8080
  const bodyParser = require("body-parser");// middleware
  const cookieParser = require('cookie-parser') // middleware
  const findUserByEmail = require('./helpers/finduserbyemail')
  const findUserByPass = require('./helpers/matchpassword')

  app.use(bodyParser.urlencoded({extended: true}));

  app.use(cookieParser())

  app.set("view engine", "ejs")


  //A function that produces a string of 6 random alphanumeric characters- Used a url shortener
  function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
  }

  let urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

  //Temp Users DB
  let users = {
    "userRandomID": {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    }
  }
  app.get("/", (req, res) => {
    res.redirect("/urls");
  });


  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
    res.render("urls_index", templateVars);
  });

  //Edit button feature
  app.get("/urls/id", (req, res) => {
    res.redirect("/urls/new");
  });


  app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.cookies.user_id]};
    res.render("urls_new", templateVars);
  });


  // POST Response to Update the Resourse
  app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body["longURL"];
    res.redirect("/urls");
  });


  app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id]
    let templateVars = { shortURL: req.params.id, longU: longURL, user: users[req.cookies.user_id]};
    res.render("urls_show", templateVars);
  });


  app.post("/urls", (req, res) => {
    // console.log(req.body);  // debug statement to see POST parameters
    // res.send("Ok");         // Respond with 'Ok' (we will replace this)
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = req.body["longURL"];
    res.redirect("/urls/" + shortUrl);
  });

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL];
    if(longURL) {
      res.redirect(longURL);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  });

  app.post("/login", (req, res) => {
    if ( req.body.email && req.body.password ){
      if (!findUserByEmail(users, req.body.email)){
        res.status(403).send('this user is not registered');
      }
      else if (!findUserByPass(users, req.body.password)){
        res.status(403).send('password is incorrect');
      }
      else {
        let id = Object.keys(users).find(key => users[key].email === req.body.email);
        res.cookie('user_id', id);
        res.redirect('/');
      }
      }
    else {
      res.status(404).send('you must have an email address or password to use this service');
    }

  });
  app.get("/login", (req, res) => {
    res.render('urls_login');
  });

  app.get("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.render('urls_login');
  });

  // Get response for user regestration
  app.get("/register", (req, res) => {
    res.render("urls_register");
  });

  // POST Response for user Registration, with the Error Massages
  app.post("/register", (req, res) => {
    if ( req.body.email && req.body.password ){
      if (findUserByEmail(users, req.body.email)){
        res.status(400).send('this user is already registered');
      }
      else {
        let randomId = generateRandomString();
        users[randomId] = {id: randomId, email: req.body.email, password: req.body.password};
        res.cookie('user_id', randomId );
        res.redirect('/');
      }
    }
    else {
      res.status(404).send('you must have an email address or password to use this service');
    }
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });