const express = require("express");

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

//login
/*app.post("/login", (req, res) => {
  const username = { users };
  res.cookie("user_id", users)
  res.redirect("/urls")
});
*/
app.post("/login", (req, res) => {
  const newUser = { 
    id: generateRandomString(),
    email: req.body.Email,
    password: req.body.password
  };
  if (newUser.email === "" || newUser.password === "") {
   res.status(403);
   res.send('Invalid Passwor');
 } else if (emailLookup(newUser.email, users)) {
    res.status(403);
    res.send('invalid email please register');
   }
  users[newUser.id] = newUser;
  console.log(users);
  res.cookie("user_id", newUser.id);
   res.redirect("/urls");
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

//register
app.post("/register", (req, res) => {
 const newUser = { 
   id: generateRandomString(),
   email: req.body.Email,
   password: req.body.password
 };
 if (newUser.email === "" || newUser.password === "") {
  res.status(400);
  res.send('Invalid Email or password');
} else if (emailLookup(newUser.email, users)) {
   res.status(400);
   res.send('Email already exists please remember your password or try forget my password featurer that are not exist yet');
  }
 users[newUser.id] = newUser;
 console.log(users);
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
  return email;
}


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});





const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  console.log(longUrl);
  const templateVars = { shortURL: req.params.shortURL, longURL: longUrl};
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});
//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

//submit
app.post("/urls/:id", (req, res) => {
  res.redirect("/url/")
})


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


