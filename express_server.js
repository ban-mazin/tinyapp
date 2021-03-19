const express = require("express");
const bcrypt = require('bcrypt');


const app = express();
const PORT = 8080; // default port 8080

//middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//cookie
var cookieParser = require('cookie-parser')
app.use(cookieParser())

//set engine
app.set("view engine", "ejs");

const users = { 
  "user1ID": {
    id: "userID", 
    email: "user@example.com", 
    password: "purple-monkey"
  },
 "user2ID": {
    id: "user2ID", 
    email: "user2@example.com", 
    password: "dis-funk"
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


app.post("/login", (req, res) => {
  // Login update: 
  // Instead of creating a randomString everytime
  // Find the user with the email, password
  // use emailLookup
  // if the user is there, then get the id of that user from the object.
  // set it as the cookie 

  const newUser = { 
    id: generateRandomString(), // get the id from emailLookup(email, password) -> result.id
    email: req.body.email,
    password: req.body.password
  };
  for (let key in users) {
    if (newUser.email == users[key].email) { //check date type and use ===
      if (bcrypt.compareSync(newUser.password, users[key].password)) {
        users[newUser.id] = newUser;
       // console.log(users);
        res.cookie("user_id", newUser.id);
        res.redirect("/urls");
       return;
      } else {
        res.status(403).send("your password does not match");
        return;
      }
    }
  }
  res.status(403).send("Email is not registered");
 });


app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("login", templateVars);
})


//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
})

//register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("register", templateVars);
})



//register
app.post("/register", (req, res) => {
 const newUser = { 
   id: generateRandomString(),
   email: req.body.email,
   password: bcrypt.hashSync(req.body.password, 10)
 };
 console.log('new', newUser)
 if (newUser.email === "" || newUser.password === "") {
  res.status(400);
  res.send('Invalid Email or password');
  console.log('newUser.email', newUser.email);
  console.log('users', users);
} else if (emailLookup(newUser.email, users)) {
   res.status(400);
   res.send('Email already exists please remember your password or try forget my password featurer that are not exist yet');
  }
 users[newUser.id] = newUser;
 //console.log(users);
 res.cookie("user_id", newUser.id);
  res.redirect("/urls");
});

// Utility Functions
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



//urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.cookies.user_id].id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  // console.log("urlDatabase:", urlDatabase);
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
  
});

app.get("/urls/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  //console.log(longUrl);
  const templateVars = { shortURL: req.params.shortURL, longURL: longUrl,  user: users[req.cookies.user_id]};
  res.render("urls_show", templateVars);
  
});


app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
});
//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

app.post("/urls/:shortURL/modify", (req, res) => {
  // need to get the form URL from req.body. 
  // req.body.URL -> longURL
  // update the urlDatabase with the short url = longURL
  const longURL = req.body.URL; // form itself
  //console.log('longUrl', longURL);
  const shortURL = req.params.shortURL;
  // this is updating the urlDatabase with the newShort and longUrl
urlDatabase[shortURL] = {
  longURL: req.body.URL,
  userID: users[req.cookies.user_id].id,
};
  res.redirect(`/urls/${shortURL}`);
});


//submit
app.post("/urls/:id", (req, res) => {
  res.redirect("/url/")
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


