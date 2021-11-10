const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8081; // default port 8080
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateRandomString(length) {
  let result = ' ';
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
  //

  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL/", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  //  console.log("req",req.params)
  // console.log("Urldatabase", urlDatabase)
  // // console.log("template", templateVars)
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!', username: req.cookies["username"]};
  res.render("hello_world", templateVars);
});

app.post("/urls/:shortURL/", (req, res) => {
  //Update urlDatabase Obj 
  urlDatabase[req.params.shortURL] = req.body.longURL
  console.log("inside edit post route", req);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  //the shortURL-longURL key-value pair should be saved to the urlDatabase when it receives a POST request to /urls
  let shortURL = generateRandomString(6)
  urlDatabase[shortURL] = `http://${req.body.longURL}`
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  // console.log(longURL)
  res.redirect(longURL);
});

//In the _header.ejs partial of app, create a <form> that POSTs to /login
//Add an endpoint to handle a POST to /login in to Express server

app.post("/login", (req,res) => {
const username = req.body.username
console.log(req.body.username)
res.cookie("username", username)
res.redirect("/urls")
});
//create a logout if username exists
app.post("/logout", (req,res) =>{
  res.clearCookie("username")
  res.redirect("/urls")
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});