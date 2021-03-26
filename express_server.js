const express = require("express");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

//helper functions
const { emailLookup , generateRandomString , urlsForUser} = require('./helpers.js');


const app = express();
const PORT = 8080; // default port 8080

//middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//cookie
app.use(cookieSession({
  name: 'session',
  keys: ['key'],
}))

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
const defTemplateVars = {
  user : null,
};

//login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email, users);
  if (user) {
    const passwordMatching = bcrypt.compareSync(password, users[user].password);
    if (passwordMatching) {
      req.session.user_id = users[user].id;
      res.redirect('/urls');
    } else {
      res.status(403);
      res.send('Invalid Password');
    }
  } else {
    res.status(403);
    res.send('invalid email please register');
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render("login", defTemplateVars);
  }
});


//logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
})

//register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const newUser = { 
    id: generateRandomString(),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  if ((!newUser.email)|| (!newUser.password)) {
   res.status(400);
   res.send('Invalid Email or password');
   return;
  }  
 if (emailLookup(newUser.email, users)) {
    res.status(400);
    res.send('Email already exists please remember your password or try forget my password featurer that are not exist yet');
    return;
   }
  users[newUser.id] = newUser;
  req.session.user_id = newUser.id;
   res.redirect("/urls");
 });
//urls
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  } 
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  console.log("userID:", userID);
  if (!userID) {
    res.status(400).send("You oyur are not loged in");
    return;
  }

  const user = users[userID];
  if (!user) {
    res.status(400).send("Invlid user");
    return;
  }

  const url = urlDatabase[req.params.id];
  if (url.userID !== userID) {
    res.status(400).send("this url is not yours");
    return;
  }


  let template = {
    user,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", template);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  const userURL = urlsForUser(req.session.user_id, urlDatabase)
  const templateVars = { 
    urls: userURL,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);

});
app.get("/", (req, res) => {
  const id = req.session.user_id;
  const userURl = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: userURl,
    user: users[id],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});




//shortUR
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const databaseId = urlDatabase[req.params.shortURL].userID;
  if (id) {
    if (databaseId === id) {
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[id],
      };
      res.render("urls_show", templateVars);
    } else {
      res.send('you dont have such URL');
    }
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (!req.session.userID) {
    return res.status(404).send();
  } else if (urlDatabase[req.params].userID !== req.session.userID) {
    return res.status(404).send();
  }
  res.redirect('/urls/:shortURL');
});

//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
});

//edit
app.post("/urls/:shortURL/modify", (req, res) => {
  const id = req.session.user_id;
  const databaseId = urlDatabase[req.params.shortURL].userID;
  if (id === databaseId) {
    const url = req.params.shortURL;
    const newUrl = req.body.URL;
    urlDatabase[url].longURL = newUrl;
    res.redirect('/urls');
  } else {
    res.status(404);
    res.send('can\'t pereform this operation');
  }
});
//url id
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  console.log("userID:", userID);
  if (!userID) {
    res.status(400).send("You oyur are not loged in");
    return;
  }

  const user = users[userID];
  if (!user) {
    res.status(400).send("Invlid user");
    return;
  }

 urlDatabase[req.params.id].long = req.body.longURL;
 res.redirect("/urls/");
});


app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
});

app.get("/", (req, res) => {
  res.render("urls_new");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


