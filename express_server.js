const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8081; // default port 8080
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = {
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
};

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateRandomString(length) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});
//create helper function to check if user is registered and exists
function checkIfUserExists(user_id){
  for (let user in users) {
    if (users[user].id === user_id) {
      return users[user]
    }
  }
  return false
}

app.get("/urls/new", (req, res) =>{
  const templateVars = { user: users[req.cookies["user_id"]] }
  if(!checkIfUserExists(req.cookies["user_id"])){
    res.redirect("/login")
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]){
    res.status(400).send('Error: tiny url does not exist');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL].shortURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: null }
  res.render("registration",templateVars)
});

//create helper function that checks if email is already in database
function checkIfEmailIsRegistered(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  }
  return false
}

app.post("/register", (req, res) => {
  //created new user object
  const user = { id: generateRandomString(4), email: req.body.email, password: req.body.password }
  //check is email or password is an empty string
  if (!user.password || !user.email) {
    res.status(400).send('Error: Status Code- 400');
  }
  //check if email is already registered
  if (checkIfEmailIsRegistered(req.body.email)) {
    res.status(400).send('Error: Email is already registered');
  }

  users[user.id] = user;

  res.cookie("user_id", user.id)
  res.redirect("/urls");
});


app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!', user: users[req.cookies["user_id"]]};
  res.render("hello_world", templateVars);
});

app.post("/urls/:shortURL/", (req, res) => {
  //Update urlDatabase Obj 
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  console.log("inside edit post route", req);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  if(!checkIfUserExists(req.cookies["user_id"])){
    res.status(403).send('Error: User not found');
  };
  //the shortURL-longURL key-value pair should be saved to the urlDatabase when it receives a POST request to /urls
  let shortURL = generateRandomString(6)
  urlDatabase[shortURL]={
    longURL:`https://${req.body.longURL}`,
    userID: req.cookies["user_id"]
  }
  console.log(urlDatabase)
  console.log("SHORT URL",shortURL.length)
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL
  // console.log(longURL)
  res.redirect(longURL);
});

//In the _header.ejs partial of app, create a <form> that POSTs to /login
//Add an endpoint to handle a POST to /login in to Express server
app.get("/login", (req, res) => {
  const user = null
  const templateVars = {user}
  res.render("login_form",templateVars)
});

//create helper function that checks if password given matches existing password 
function checkIfPasswordMatch(password) {
  for (let user in users) {
    if (users[user].password === password) {
      return users[user]
    }
  }
  return false
}

app.post("/login", (req, res) => {
  const user = { id: generateRandomString(4), email: req.body.email, password: req.body.password }
  if (!checkIfEmailIsRegistered(req.body.email) || !checkIfPasswordMatch(req.body.password)) {
    res.status(403).send('Error: Email and/or password cannot be found');
  }
  if (checkIfEmailIsRegistered(req.body.email)) {
    if (checkIfPasswordMatch(req.body.password)) {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
  }
});




//create a logout if username exists
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});