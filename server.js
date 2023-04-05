const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

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
  chatBot.personality = req.body.personality;
  res.json(chatBot);
});

// Modify the interface of a ChatBot
app.put('/chatbots/:id/interface', (req, res) => {
  const chatBot = chatBots.find(c => c.id === parseInt(req.params.id));
  if (!chatBot) return res.status(404).send('The ChatBot with the given ID was not found.');
  chatBot.interface = req.body.interface;
  res.json(chatBot);
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

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
  res.redirect('/page');
});

app.get('/register', (req, res) => {
  res.render('register');
});


app.listen(3000, () => console.log('Server listening on port 3000...'));

