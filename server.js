const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const Classchatbot = require('./Classchatbot'); // import the Classchatbot class
const databaseHandler = require('./databaseHandler.js'); // import the databaseHandler module
require('dotenv').config({ path:__dirname+'/.env'} ); // import and configure dotenv
const MongoClient = require('mongodb').MongoClient; // import MongoClient from mongodb
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
console.log(process.env.DB_URI); // print the value of the DB_URI environment variable to the console
app.set('view engine', 'ejs'); // set EJS as the view engine
app.use(bodyParser.urlencoded({ extended: true }));

// Define a data model to represent ChatBots and their associated information
const chatBots = [
  { id: 1, name: 'Steeve', personality: 'standard.rive', interface: 'web' },
  { id: 2, name: 'Eude', personality: 'custom.rive', interface: 'discord' },
  { id: 3, name: 'Hubert', personality: 'advanced.rive', interface: 'slack' }
];

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/addbot', (req, res) => {
  res.render('addbot');
});

app.post('/create-chatbot', (req, res) => {
  const name = req.body.name;
  const personality = req.body.personality;

  // Load the brain file based on the selected personality
  let brainFile;
  if (personality === 'standard') {
    brainFile = 'standard.rive';
  } else if (personality === 'friendly') {
    brainFile = 'friendly.rive';
  } else if (personality === 'professional') {
    brainFile = 'professional.rive';
  } else if (personality === 'humorous') {
    brainFile = 'humorous.rive';
  }

  // Create and configure the chatbot with the selected name and loaded brain file
  const myChatbot = new Classchatbot(name, personality);
  myChatbot.loadBrainFile(`${brainFile}`);
  app.locals.myChatbot = myChatbot;

  // Redirect to the '/interface' route
  res.redirect('/interface');
});

app.get('/interface', (req, res) => {
  // Render the interface view and pass the chat log as well
  const myChatbot = app.locals.myChatbot; 
  res.render('interface', { myChatbot });
});

app.post('/interface', (req, res) => {
  const message = req.body.message;
  app.locals.myChatbot.sendMessage(message);
  // Redirect to the '/interface' route to display the updated chat log
  res.redirect('/interface');
});

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
// Define a middleware function to check if user is authenticated
function authenticate(req, res, next) {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/login');
  }
  next();
}
// Define routes for login and logout
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  (async () => {
    const user = await databaseHandler.getUser(username);

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.isAuthenticated = true;
      req.session.username = username;
      return res.redirect('addbot');
    }
    res.render('login', { error: 'Invalid username or password' });
  })().catch(err => {
    console.log(err);
    res.status(500).send('Internal Server Error');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login')});
});


// Define routes for registration
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  (async () => {
    const user = await getUser(username);
    if (user) {
      return res.render('register', { error: 'Username already exists' });
    }
    const hash = bcrypt.hashSync(password, saltRounds);
    databaseHandler.createUser({
      username : username,
      email : email,
      password : hash
    }).catch(console.error);
    req.session.isAuthenticated = true;
    req.session.username = username;
    res.redirect('/home');
  })().catch(err => {
    console.log(err);
    res.status(500).send('Internal Server Error');
  });
});

// Define route for home page
app.get('/home', authenticate, (req, res) => {
  res.render('home', { username: req.session.username });
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
