const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const Classchatbot = require('./Classchatbot'); // import the Classchatbot class

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Set up body parser middleware

// Define a data model to represent ChatBots and their associated information
const chatBots = [
  { id: 1, name: 'Steeve', personality: 'standard.rive', interface: 'web' },
  { id: 2, name: 'Eude', personality: 'custom.rive', interface: 'discord' },
  { id: 3, name: 'Hubert', personality: 'advanced.rive', interface: 'slack' }
];
// Create a new ChatBot
app.post('/chatbots', (req, res) => {
  const chatBot = {
    id: chatBots.length + 1,
    name: req.body.name,
    personality: req.body.personality,
    interface: req.body.interface
  };
  chatBots.push(chatBot);
  res.status(201).json(chatBot);
});

// Get all ChatBots
app.get('/chatbots', (req, res) => {
  res.json(chatBots);
});

// Get a specific ChatBot by ID
app.get('/chatbots/:id', (req, res) => {
  const chatBot = chatBots.find(c => c.id === parseInt(req.params.id));
  if (!chatBot) return res.status(404).send('The ChatBot with the given ID was not found.');
  res.json(chatBot);
});

// Update an existing ChatBot
app.put('/chatbots/:id', (req, res) => {
  const chatBot = chatBots.find(c => c.id === parseInt(req.params.id));
  if (!chatBot) return res.status(404).send('The ChatBot with the given ID was not found.');
  chatBot.name = req.body.name;
  chatBot.personality = req.body.personality;
  chatBot.interface = req.body.interface;
  res.json(chatBot);
});

// Delete a ChatBot
app.delete('/chatbots/:id', (req, res) => {
  const chatBot = chatBots.find(c => c.id === parseInt(req.params.id));
  if (!chatBot) return res.status(404).send('The ChatBot with the given ID was not found.');
  const index = chatBots.indexOf(chatBot);
  chatBots.splice(index, 1);
  res.json(chatBot);
});

// Modify the personality of a ChatBot
app.put('/chatbots/:id/personality', (req, res) => {
  const chatBot = chatBots.find(c => c.id === parseInt(req.params.id));
  if (!chatBot) return res.status(404).send('The ChatBot with the given ID was not found.');

  // Update the personality file of the ChatBot
  chatBot.personality = req.body.personality;
  bot.updatePersonality(chatBot.personality);

  res.json(chatBot);
});

// Modify the interface of a ChatBot
app.put('/chatbots/:id/interface', (req, res) => {
  const chatBot = chatBots.find(c => c.id === parseInt(req.params.id));
  if (!chatBot) return res.status(404).send('The ChatBot with the given ID was not found.');

  // Update the interface file of the ChatBot
  chatBot.interface = req.body.interface;
  bot.updateInterface(chatBot.interface);

  res.json(chatBot);
});

const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');


// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Read login information from file
let logins;
try {
  const fileContents = fs.readFileSync('logins.json', 'utf8');
  logins = JSON.parse(fileContents || '[]');
} catch (err) {
  console.error(`Error reading login file: ${err}`);
  logins = [];
}
// Define a middleware function to check if user is authenticated
function authenticate(req, res, next) {
  if (!req.session || !req.session.isAuthenticated) {
    return res.redirect('/login');
  }
  next();
}
app.get('/', (req, res) => {
  res.render('home.ejs');
});

// Define routes for login and logout
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = logins.find((u) => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.isAuthenticated = true;
    req.session.username = username;
    return res.redirect('interface.ejs');
  }
  res.render('login', { error: 'Invalid username or password' });
});

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

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
// Define routes for registration
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
	
	app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const user = logins.find((u) => u.username === username);
  if (user) {
    return res.render('register', { error: 'Username already exists' });
  }
  const hash = bcrypt.hashSync(password, saltRounds);
  logins.push({ username, email, password: hash });
  fs.writeFileSync('logins.json', JSON.stringify(logins));
  req.session.isAuthenticated = true;
  req.session.username = username;
  res.redirect('/home');
});

// Define route for home page
app.get('/home', authenticate, (req, res) => {
  res.render('home', { username: req.session.username });
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');

app.listen(3000, () => console.log('Server listening on port 3000...'));
