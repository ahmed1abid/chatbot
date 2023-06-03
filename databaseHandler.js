const path = require('path');
const MongoClient = require('mongodb').MongoClient; // import MongoClient from mongodb


const uri =  "mongodb+srv://yasserblank:DaaNRaQXEtHa8NO1@cluster0.f7iqrzx.mongodb.net/?retryWrites=true&w=majority";
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
      console.log(`User with username ${result.username} found`);
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
async function createBot(chatbotListing){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("bots").insertOne(chatbotListing);
    console.log(`New chatbot created with the following id: ${result.insertedId}`);
  }catch(err){
    console.log(err);
  } finally{  
    await client.close();
  }
} 

async function updateBot(filter, options, chatbotUpdateListing){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("bots").updateOne(filter, options, chatbotUpdateListing);
    console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
  }catch(err){
    console.log(err);
  } finally{
    await client.close();
  }
}
async function getBots(user){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("bots").find({user: user}).toArray();
    if(result.length > 0){
      console.log(`Bots found : ${result.length}`);
      return  result;
    }
    else{
      console.log(`No bots found`);
      return null;
    }
  } catch(err){ 
    console.log(err);
  } finally{
    await client.close();
  }
}
async function getChatLog(user, name){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("chatlogs").find({user: user, botName: name});
    if(result){
      console.log(`Chatlogs found`);
      return  result.chatlog;
    }
    else{
      console.log(`No chatlogs found`);
      return null;
    }
  } catch(err){
    console.log(err);
  } finally{
    await client.close();
  }
}
async function getPersonality(user, name){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("personalities").find({user: user, botName: name});
    if(result){
      console.log(`Personalities found`);
      return  result.personality;
    }
    else{
      console.log(`No personalities found`);
      return null;
    }
  } catch(err){
    console.log(err);
  } finally{
    await client.close();
  }
}
async function addChatbot(chatbotListing){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("bots").insertOne(chatbotListing);
    console.log(`New chatbot created with the following id: ${result.insertedId}`);
  }catch(err){
    console.log(err);
  } finally{  
    await client.close();
  }
}

function uservars_transformer(data){
  const newData = {};
  let shouldAdd = false;
  keys = Object.keys(data)
  for (let i = 0; i < keys.length; i++) {
    if (shouldAdd) {
      newkey = keys[i].toString();
      newData[newkey] = data[keys[i]];
    }
    if (keys[i]== '__last_triggers__') {
      shouldAdd = true;
    }
  }
  console.log(newData);
  return newData;
}
async function updateData(user,name,data){
  const client = new MongoClient(uri);
  console.log(data);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("uservars").updateOne({user: user, botName: name},data,{ upsert: true });
    console.log(`New chatbot updated with the following id: ${result.insertedId}`);
  }catch(err){
    console.log(err);
  } finally{
    await client.close();
  }
}

async function getUservars(user, name){
  const client = new MongoClient(uri);
  try{
    await client.connect();
    console.log("Connected correctly to server");
    const result = await client.db("chatbot_data").collection("uservars").findOne({botName: name, user: user},{projection : {_id : 0 , botName: 0, user: 0}});
    if(result){
      console.log(`Uservars found`);
      return  result;
    }
    else{
      console.log(`No uservars found`);
      return null;
    }
  } catch(err){
    console.log(err);
  } finally{
    await client.close();
  }
}

module.exports = {run, listDatabases, createUser, getUser, createBot, updateBot, getBots,addChatbot, getChatLog, getPersonality, uservars_transformer, updateData, getUservars};