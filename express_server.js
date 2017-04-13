  const express = require("express");
  const app = express();
  const PORT = process.env.PORT || 8080; // default port 8080
  const bodyParser = require("body-parser");// middleware
  const cookieParser = require('cookie-parser') // middleware

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


  app.get("/", (req, res) => {
    res.redirect("/urls");
    // res.send(req.cookies.userName);
  });

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase, username: req.cookies["userName"]};
    res.render("urls_index", templateVars);
  });

  //Edit button feature
  app.get("/urls/id", (req, res) => {
    res.redirect("/urls/new");
  });


  app.get("/urls/new", (req, res) => {
    let templateVars = { username: req.cookies["userName"]};
    res.render("urls_new", templateVars);
  });


  // POST Response to Update the Resourse
  app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body["longURL"];
    res.redirect("/urls");
  });


  app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id]
    let templateVars = { shortURL: req.params.id, longU: longURL, username: req.cookies["userName"]};
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

  // POST Response to User name "Cookies Test"
  app.post("/login", (req, res) => {
    res.cookie('userName', req.body.username);
    res.redirect('/');
  });

  // POST Response to Delete User name "Cookies Test"
  app.post("/logout", (req, res) => {
    res.clearCookie('userName');
    res.redirect('/');
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });