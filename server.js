const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const Classchatbot = require('./Classchatbot'); // import the Classchatbot class

app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

// Initialize an empty chat log

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are valid
  // ...
  // If valid, redirect to page
  res.redirect('/whichchat');
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

  console.log(app.locals.myChatbot);
  // Redirect to the '/interface' route
  res.redirect('/interface');
});

app.get('/register', (req, res) => {
  res.render('register');
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

app.listen(3000, () => console.log('Server listening on port 3000...'));
