const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const Classchatbot = require('./Classchatbot'); // import the Classchatbot class
const databaseHandler = require('./databaseHandler.js'); // import the databaseHandler module
require('dotenv').config({ path:__dirname+'/.env'} ); // import and configure dotenv
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
console.log(process.env.DB_URI); // print the value of the DB_URI environment variable to the console
app.set('view engine', 'ejs'); // set EJS as the view engine
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/addbot', (req, res) => {
  res.render('addbot');
});

app.post('/create-chatbot', (req, res) => {
  if(req.session.isAuthenticated == false){
    res.render('notlogged')
  }
  else{
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
    const myChatbot = new Classchatbot(req.session.username ,name, personality);
    myChatbot.loadBrainFile(`${brainFile}`);
    req.session.botNames += [name];
    app.locals.myChatbot = myChatbot;
     chatbotListing = {
      user : req.session.username,
      botName : name
    }
    databaseHandler.addChatbot(chatbotListing);
  // Redirect to the '/interface' route to display the chatbot interface
    res.redirect('/interface');
  }
});

app.get('/interface', (req, res) => {
  // Render the interface view and pass the chat log as well
  const myChatbot = app.locals.myChatbot;
  res.render('interface', { myChatbot });
});

app.post('/interface', (req, res) => {
  const message = req.body.message;
  app.locals.myChatbot.sendMessage(message);
  botName = app.locals.myChatbot.name;
  // Redirect to the '/interface' route to display the updated chat log
  console.log(botName);
  //console.log(app.locals.myChatbot.getChatLog());
  res.redirect('/interface');
  uservars = app.locals.myChatbot.brain.getUservars(req.session.username);
  new_uservars = databaseHandler.uservars_transformer(uservars)
  data = {
    "$set": new_uservars
  }
  databaseHandler.updateData(req.session.username,botName,data);
});


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
      return res.redirect('botMenu');
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
app.get('/botMenu', (req, res) => {
  // Get the bot names associated with the user in the session
  (async() => {
    const bots = await databaseHandler.getBots(req.session.username); 
    if (bots == null) {
      console.log("none");
      return res.render('botMenu', { botNames: [] });
    }
    else{
      const botNames = bots.map(bot => bot.botName);
      req.session.botNames = botNames;
      // Render the botMenu view and pass the bot names as a local variable
      return res.render('botMenu', { botNames });
    }
  })().catch(err => {
    console.log(err);
    res.status(500).send('Internal Server Error');
  })
});
app.post('/botMenu', (req, res) => {
  (async() => { 
    app.locals.botName = req.body.name;
    console.log(app.locals.botName);
    app.locals.personality = 'standard'; //databaseHandler.getPersonality(req.session.username, req.session.botName);
    // Load the brain file based on the selected personality
    let brainFile;
    if (app.locals.personality === 'standard') {
      brainFile = 'standard.rive';
    } else if (app.locals.personality === 'friendly') {
      brainFile = 'friendly.rive';
    } else if (app.locals.personality === 'professional') {
      brainFile = 'professional.rive';
    } else if (app.locals.personality === 'humorous') {
      brainFile = 'humorous.rive';
    }
  //  Create and configure the chatbot with the selected name and loaded brain file
    const myChatbot = new Classchatbot(req.session.username ,app.locals.botName, app.locals.personality);
    myChatbot.loadBrainFile(`${brainFile}`);
    uservars = await databaseHandler.getUservars(req.session.username, app.locals.botName);
    console.log(uservars);
    myChatbot.setUservars(req.session.username, uservars);
    app.locals.myChatbot = myChatbot;
  //  Redirect to the '/interface' route
    res.redirect('/interface');
  })().catch(err => {
    console.log(err);
    res.status(500).send('Internal Server Error');
  })
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
