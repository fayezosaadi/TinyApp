  const express = require("express");
  const app = express();
  const PORT = process.env.PORT || 8080; // default port 8080
  const bodyParser = require("body-parser");// middleware
  var cookieSession = require('cookie-session');
  const findUserByEmail = require('./helpers/finduserbyemail')
  const findUserByPass = require('./helpers/matchpassword')
  const bcrypt = require('bcrypt');
  app.use(bodyParser.urlencoded({extended: true}));

  app.use(cookieSession({
    name: 'session',
    keys: ['lighthouse'],
    maxAge: 24 * 60 * 60 * 1000
  }));

  app.set("view engine", "ejs")

  function generateRandomString() {
    return Math.random().toString(36).substr(2, 6);
  }

  //URLs DB
  let urlDatabase = {};

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

  app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase, user: users[req.session.user_id]};
    console.log(templateVars.user);
    if (!req.session['user_id']){
      res.redirect("/login")
    }
    else{ res.render("urls_index", templateVars);
    }
  });

  app.get("/urls/id", (req, res) => {
    res.redirect("/urls/new");
  });

  app.get("/urls/new", (req, res) => {
    let templateVars = { user: users[req.session.user_id]};
    if (!req.session.user_id){
      res.redirect("/login")
    }
    else {
      res.render("urls_new", templateVars);
    }
  });

  app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body["longURL"];
    res.redirect("/urls");
  });

  app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id].longURL
    let templateVars = { shortURL: req.params.id, longU: longURL, user: users[req.session.user_id]};
    res.render("urls_show", templateVars);
  });

  app.post("/urls", (req, res) => {
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {longURL: req.body["longURL"], shortURL: shortUrl, user_id: req.session.user_id};
    res.redirect('/urls');
  });

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL].longURL;
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
    const email = req.body.email;
    const password = req.body.password;
    console.log(email + " " + password);
    if (email && password) {
    var user = findUserByEmail(users, email);
      if (!findUserByEmail(users, email)){
        res.status(403).send('this user is not registered');
      }
      else if (!bcrypt.compareSync(password, user.password)){
        res.status(403).send('password is incorrect');
      }
      else {
        let id = Object.keys(users).find(key => users[key].email === email);
        req.session.user_id = id;
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
    req.session = null;
    res.render('urls_login');
  });

  app.get("/register", (req, res) => {
    res.render("urls_register");
  });

  app.post("/register", (req, res) => {
    if ( req.body.email && req.body.password ){
      if (findUserByEmail(users, req.body.email)){
        res.status(400).send('this user is already registered');
      }
      else {
        let password = req.body.password;
        let hashed_password = bcrypt.hashSync(password, 10);
        let randomId = generateRandomString();
        users[randomId] = {id: randomId, email: req.body.email, password: hashed_password};
        console.log(users)
        req.session.user_id = randomId;
        res.redirect('urls');
      }
    }
    else {
      res.status(404).send('you must have an email address or password to use this service');
    }
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });