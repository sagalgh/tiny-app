const { assert } = require('chai');

const { urlsForUser, checkIfUserExists, checkIfEmailIsRegistered} = require('./helpers.js');

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
    id: "userRandomID",
    email: "user@example.com",
    password: "secret-pass"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "shaahiyosheeko@example.com",
    password: "wadaani"
  }
};

describe('#checkIfEmailIsRegistered', function() {
  it('should return a user with valid email', function() {
    const user = checkIfEmailIsRegistered("user@example.com", testUsers);
    const expectedUser = testUsers.userRandomID;
    assert.deepEqual(user, expectedUser);
  });
  it('should return undefined if email does not exist in database', function() {
    const user = checkIfEmailIsRegistered("obiwan@example.com", testUsers);
    assert.equal(user, undefined);
  });

});

describe('#urlsForUser', function() {
  it('should return the corresponding URL for given user', function() {
    const userUrls = urlsForUser("user2RandomID", urlDatabase);
    const expectedUserURLs = {
      i3BoGr: "https://www.google.ca"
    };
    assert.deepEqual(userUrls, expectedUserURLs);
  });
  it('should return an empty object if user has no URLs', function() {
    const userUrls = urlsForUser("user3RandomID", urlDatabase);
    const expectedUserURLs = {};
    assert.deepEqual(userUrls, expectedUserURLs);
  });
});

describe('#checkIfUserExists', function() {
  it('should return a user with valid userID', function() {
    const user = checkIfUserExists("userRandomID", testUsers);
    const expectedUser = testUsers.userRandomID;
    assert.deepEqual(user, expectedUser);
  });
  it('should return undefined if userID does not exist in database', function() {
    const user = checkIfUserExists("user4RandomID", testUsers);
    assert.equal(user, undefined);
  });
});

