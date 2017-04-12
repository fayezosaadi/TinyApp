  const express = require("express");
  const app = express();
  const PORT = process.env.PORT || 8080; // default port 8080
  const bodyParser = require("body-parser");

  app.use(bodyParser.urlencoded({extended: true}));
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
    res.end("Hello!");
  });

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });


  app.get("/urls/:id", (req, res) => {
    let longURL = urlDatabase[req.params.id]
    let templateVars = { shortURL: req.params.id, longU: longURL };
    res.render("urls_show", templateVars);
  });

  app.post("/urls", (req, res) => {
    // console.log(req.body);  // debug statement to see POST parameters
    // res.send("Ok");         // Respond with 'Ok' (we will replace this)
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = req.body["longURL"];
    res.redirect("/urls/" + shortUrl);
       console.log(urlDatabase);
  });

  app.get("/u/:shortURL", (req, res) => {
    let longURL = urlDatabase[req.params.shortURL]
    if(longURL) {
      res.redirect(longURL);
    } else {
      res.status(404).send('Not found');
    }
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });