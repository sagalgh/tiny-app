const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const express = require("express");
const { urlsForUser, checkIfUserExists, checkIfEmailIsRegistered, checkIfShortURLexists, generateRandomString} = require('helpers.js');
// const cookieParser = require('cookie-parser')- no longer needed 
const cookieSession = require('cookie-session')
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "easy"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


app.get("/", (req, res) => {
  if(!checkIfUserExists(req.session.userId, users)){
    res.redirect("/login")
  };
  res.redirect("/urls")
});




app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.userId,urlDatabase), user: users[req.session.userId]};
  // console.log("-----", urlsForUser(req.session.userId,urlDatabase))
  if(!req.session.userId){
    res.send("Register/Login to access page")

  } else{
  res.render("urls_index", templateVars);
  }
});




app.get("/urls/new", (req, res) =>{
  const templateVars = { user: users[req.session.userId] }
  if(!checkIfUserExists(req.session.userId, users)){
    res.redirect("/login")
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  //check to see if user is logged in 
  if(!req.session.userId){
    res.send("Register/Login to access page")
  }
  if(!urlDatabase[req.params.shortURL]){
    res.status(400).send('Error: tiny url does not exist');
  }
  if(urlDatabase[req.params.shortURL].userID !== req.session.userId ){
    res.send('Error: Not the owner of shortURL');
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userId] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//function that checks if shortURL belongs to user

app.post("/urls/:shortURL/delete", (req, res) => {
  if(!req.session.userId){
    res.send("Register/Login to access page")

  }
  if(urlDatabase[req.params.shortURL].userID !== req.session.userId ){
    res.send("Error, do not have access")
    return 
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/register", (req, res) => { 
  const templateVars = { user: null }
  res.render("registration",templateVars)
});


app.post("/register", (req, res) => {
  //created new user object
  const hashedPassword = bcrypt.hashSync(req.body.password,10);
  const user = { id: generateRandomString(4), email: req.body.email, password: hashedPassword }
  //check is email or password is an empty string
  if (!user.password || !user.email) {
    res.send('No email or password entered');
  }
  //check if email is already registered
  if (checkIfEmailIsRegistered(req.body.email,users)) {
    res.status(400).send('Error: Email is already registered');
  }

  users[user.id] = user;

  // res.cookie("user_id", user.id)
  req.session.userId = user.id;
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!', user: users[req.session.userId]};
  res.render("hello_world", templateVars);
});

app.post("/urls/:shortURL/", (req, res) => {
  //check to see if user is logged in 
  if(!req.session.userId){
    res.send("Register/Login to access page")
  }
  //Update urlDatabase Obj 
  urlDatabase[req.params.shortURL].longURL = req.body.longURL
  console.log(urlDatabase[req.params.shortURL].longURL )
  console.log("inside edit post route", req);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  if(!checkIfUserExists(req.session.userId,users)){
    res.status(403).send('Error: User not found');
  };
  //the shortURL-longURL key-value pair should be saved to the urlDatabase when it receives a POST request to /urls
  let shortURL = generateRandomString(6)
  urlDatabase[shortURL]={
    longURL:`https://${req.body.longURL}`,
    userID: req.session.userId
  }
  // console.log(urlDatabase)
  // console.log("SHORT URL",shortURL.length)
  res.redirect(`/urls/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  if(!checkIfShortURLexists(req.params.shortURL,urlDatabase)){
    res.send("URL does not exist!")
  }
  const longURL = urlDatabase[shortURL].longURL
  if(!longURL){
    res.send ("URL does not exist!")
  }
  
  if(urlDatabase[req.params.shortURL].userID !== req.session.userId ){
    res.send('Error: Not the owner of shortURL');
  }
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
// function checkIfPasswordMatch(password) {
//   for (let user in users) {
//     if (users[user].password === password) {
//       return users[user]
//     }
//   }
//   return false
// }

app.post("/login", (req, res) => {
  const user = checkIfEmailIsRegistered(req.body.email, users);
  const hashedPassword = bcrypt.hashSync(req.body.password,10);
  if (!checkIfEmailIsRegistered(req.body.email) || !bcrypt.compareSync(req.body.password,hashedPassword)) {
    res.status(403).send('Error: Email and/or password cannot be found');
  }
  if (checkIfEmailIsRegistered(req.body.email, users) && bcrypt.compareSync(req.body.password,hashedPassword)) {
      // res.cookie("user_id", user.id);
      req.session.userId = user.id;
      res.redirect("/urls");
    }
    // console.log(users)
});




//create a logout if username exists
app.post("/logout", (req, res) => {
  //res.clearCookie("user_id")
  req.session = null;
  res.redirect("/urls")
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//1. When hashing user's password :make sure the users[id] object is inside of the bcrypt callback:
//also reserve ur response (i.e. re.direct etc.) until callback has been completed- so it can be asychronous and the hash is completed b4 response
// bcrypt.hash(password, salt, (err,has)=> {
//   users[id] = {
//     id,
//     email,
//     password: hash
//     res.redirect('login');
// });
//  }})
//2. To compare the 2 passwords use (make sure ur response is in the call back):
// bcrypt.compare(password,user.password,(err, result) => {
//   if (!result){
//     return res.status(400).send('password does not match')
//   }
//  res.cookie('userId', )
// }
// )

//cookie encryption:
//plaintext => set the cookie =>middleware encrypt =>browser