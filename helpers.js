

// helper Functions
const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let encodedString = '';
  for (let i = 0; encodedString.length <= 5; i++) {
    const randomNum = Math.floor(Math.random() * (36 - 0) + 0);
    encodedString += chars[randomNum];
  }
  return encodedString;
};

function emailLookup(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
}


function urlsForUser(id, database) {
  const userURLs = {};
  for (let url in database) {
    if (database[url].userID === id) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
}



module.exports = {
  emailLookup,
  generateRandomString,
  urlsForUser
};