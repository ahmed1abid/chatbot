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
module.exports = {run, listDatabases, createUser, getUser};