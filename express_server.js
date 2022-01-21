const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const express = require("express");
const { urlsForUser, checkIfUserExists, checkIfEmailIsRegistered, generateRandomString} = require('./helpers.js');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
};

const users = {
};

app.get("/", (req, res) => {
  if (!checkIfUserExists(req.session.userId, users)) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.userId,urlDatabase), user: users[req.session.userId]};
  if (!req.session.userId) {
    res.send("Register/Login to access page");
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) =>{
  const templateVars = { user: users[req.session.userId] };
  if (!checkIfUserExists(req.session.userId, users)) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.userId) {
    return res.send("Register/Login to access page");
  }
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(400).send('Error: tiny url does not exist');
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.userId) {
    return res.send('Error: Not the owner of shortURL');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userId] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.userId) {
    return res.send("Register/Login to access page");

  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.userId) {
    return res.send("Error, do not have access");
  
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (checkIfUserExists(req.session.userId, users)) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("registration",templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.password || !req.body.email) {
    res.status(400).send("No email or password entered. Please <a href='/register'> register </a>.");
    return;
  }
  if (checkIfEmailIsRegistered(req.body.email,users)) {
    res.status(400).send("Error: Email is already registered. Please <a href='/login'> here </a>");
    return;
  }
  const hashedPassword = bcrypt.hashSync(req.body.password,10);
  const user = { id: generateRandomString(4), email: req.body.email, password: hashedPassword };
  users[user.id] = user;
  req.session.userId = user.id;
  res.redirect("/urls");
});


app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  if (!checkIfUserExists(req.session.userId,users)) {
    res.status(403).send('Error: User not found');
  }
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL:req.body.longURL,
    userID: req.session.userId
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL]) {
    res.send("URL does not exist!");
  }
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  //if user is logged in redirt to /urls
  if (checkIfUserExists(req.session.userId, users)) {
    return res.redirect("/urls");
  }
  const templateVars = {user: users[req.session.userId]};
  res.render("login_form",templateVars);
});

app.post("/login", (req, res) => {
  const user = checkIfEmailIsRegistered(req.body.email, users);
  if (!user) {
    res.status(403).send("Error: Invalid e-mail. Please <a href='/login'> login </a>.");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send("Error: Invalid password. Please <a href='/login'> login </a>.");
  }
  req.session.userId = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

