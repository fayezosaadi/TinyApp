const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const findUserByEmail = require('./helpers/finduserbyemail');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse'],
  maxAge: 24 * 60 * 60 * 1000,
}));
app.set('view engine', 'ejs');

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const urlDatabase = {};
const users = {};

app.get('/', (req, res) => {
  if (!req.session['user_id']) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  if (!req.session['user_id']) {
    res.status(401);
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_401', templateVars);

  } else {
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
    res.status(200);
    res.render('urls_index', templateVars);
  }
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!req.session.user_id) {
    res.status(401);
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_401', templateVars);
  } else {
    res.status(200);
    res.render('urls_new', templateVars);
  }
});

app.post('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    res.render('urls_404');
  } else if (!req.session.user_id) {
    res.status(401);
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_401', templateVars);
  } else if (req.session.user_id !== urlDatabase[req.params.id].user_id) {
    res.status(403);
    res.render('urls_403');
  } else {
    urlDatabase[req.params.id].longURL = req.body['longURL'];
    res.redirect('/urls/' + req.params.id);
  }
});

app.get('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    res.render('urls_404');
  } else if (!req.session.user_id) {
    res.status(401);
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_401', templateVars);
  } else if (req.session.user_id !== urlDatabase[req.params.id].user_id) {
    res.status(403);
    res.render('urls_403');
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    const templateVars = {
      shortURL: req.params.id, longU: longURL, user: users[req.session.user_id], urls: urlDatabase};
    res.status(200);
    res.render('urls_show', templateVars);
  }
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.status(401);
    const templateVars = { user: users[req.session.user_id] };
    res.render('urls_401', templateVars);
  } else {
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = { longURL: req.body['longURL'], shortURL: shortUrl, user_id: req.session.user_id };
    res.redirect('/urls/' + shortUrl);
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('Not found');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {
    const user = findUserByEmail(users, email);
    if (!findUserByEmail(users, email)) {
      res.status(401);
      const templateVars = { user: users[req.session.user_id] };
      res.render('urls_user_not_found', templateVars);
    } else if (!bcrypt.compareSync(password, user.password)) {
      res.status(401);
      const templateVars = { user: users[req.session.user_id] };
      res.render('urls_user_not_found', templateVars);
    } else {
      const id = Object.keys(users).find(key => users[key].email === email);
      req.session.user_id = id;
      res.redirect('/');
    }
  } else {
    res.status(404).send('you must have an email address or password to use this service');
  }
});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/');
  } else {
    res.status(200);
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
    res.render('urls_login', templateVars);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/');
  } else {
    res.status(200);
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
    res.render('urls_register', templateVars);
  }
});

app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (findUserByEmail(users, req.body.email)) {
      res.status(400).send('this user is already registered');
    } else {
      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const randomId = generateRandomString();
      users[randomId] = { id: randomId, email: req.body.email, password: hashedPassword };
      req.session.user_id = randomId;
      res.redirect('/');
    }
  } else {
    res.status(400).send('you must have an email address or password to use this service');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
