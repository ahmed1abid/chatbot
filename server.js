const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const Classchatbot = require('./Classchatbot'); // import the Classchatbot class
require('dotenv').config({ path:__dirname+'/.env'} ); // import and configure dotenv
const MongoClient = require('mongodb').MongoClient; // import MongoClient from mongodb
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const path = require('path');
console.log(process.env.DB_URI); // print the value of the DB_URI environment variable to the console

const uri = "mongodb+srv://yasserblank:DaaNRaQXEtHa8NO1@cluster0.f7iqrzx.mongodb.net/?retryWrites=true&w=majority";
app.set('view engine', 'ejs'); // set EJS as the view engine
app.use(bodyParser.urlencoded({ extended: true }));

async function listDatabases(client){
  const databasesList = await client.db().admin().listDatabases();
  console.log("Databases:");
  databasesList.databases.forEach(db => 
    console.log(` - ${db.name}`));
}
// Use connect method to connect to the server
async function run(){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    await listDatabases(client);
  }catch(err){
    console.log(err);
  } finally{  
    await client.close();
  }
}

async function createUser(newListing){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("accounts").insertOne(newListing);
    console.log(`New account created with the following id: ${result.insertedId}`);
  }catch(err){
    console.log(err);
  } finally{  
    await client.close();
  }
}

async function getUser(username){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("accounts").findOne({username: username});
    if(result){
      console.log(`User with username ${result.username} and password ${result.password} found`);
      return  result;
    }
    else{
      console.log(`User with username ${username} not found`);
      return null;
    }
  }catch(err){
    console.log(err);
  } finally{  
    await client.close();
  }
}

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
    const user = await getUser(username);

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.isAuthenticated = true;
      req.session.username = username;
      return res.redirect('interface.ejs');
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
    createUser({
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
