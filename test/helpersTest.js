const { assert } = require('chai');

const { urlsForUser, checkIfUserExists, checkIfEmailIsRegistered, checkIfShortURLexists, generateRandomString } = require('../helpers.js');

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

const testUsers = {
  "userRandomID": {
    id: "testing",
    email: "user@example.com",
    password: "secret-pass"
  },
  "user2RandomID": {
    id: "shaah",
    email: "iyosheeko@example.com",
    password: "wadaani"
  }
};

describe('#checkIfEmailIsRegistered', function() {
  it('should return a user with valid email', function() {
    const user = checkIfEmailIsRegistered("user@example.com", testUsers)
    const expectedUserID = testUsers.userRandomID;
    assert.equal(user, expectedUserID)
  });
  it('should return undefined if email does not exist in database', function() {
    const user = checkIfEmailIsRegistered("obiwan@example.com", testUsers)
    const expectedUserID = testUsers.userRandomID;
    assert.equal(user, expectedUserID)
  });

});

describe('#urlsForUser', function() {
  it('should return the corresponding URL of valid email', function() {
    const userUrls = urlsForUser(" b6UTxQ", urlDatabase)
    const expectedUserID = ;
    assert.equal(user, expectedUserID)
  });
  it('should return undefined if email does not exist in database', function() {
    const user = urlsForUser("obiwan@example.com", testUsers)
    const expectedUserID = testUsers.userRandomID;
    assert.equal(user, expectedUserID)
  });

});

