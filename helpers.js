
//helper function returns the URLs where the 
//userID is equal to the id of the currently logged-in user.
const urlsForUser = function(id,urlDatabase){
  const userURL= {};
  for (let shortURL in urlDatabase){
    if(urlDatabase[shortURL].userID === id){
     userURL[shortURL] = urlDatabase[shortURL].longURL
    };
  }
  return userURL;

};
//create helper function to check if user is registered and exists
const checkIfUserExists = function(user_id,users){
  for (let user in users) {
    if (users[user].id === user_id) {
      return users[user]
    }
  }
  return false
}
//create helper function that checks if email is already in database
const checkIfEmailIsRegistered = function (email,users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user]
    }
  }
  return false
}

//helper to check if shortURL exists in database
const checkIfShortURLexists = function(id,urlDatabase){
  for (let shortURL in urlDatabase){
  if(urlDatabase[shortURL].shortURL === id){
    return id
  }
  return false
}
}


const generateRandomString= function(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = {
  urlsForUser,
  checkIfUserExists,
  checkIfEmailIsRegistered,
  checkIfShortURLexists,
  generateRandomString
};  