const mongoose = require('mongoose');
const dbName = process.env.DB;
const username = process.env.ATLAS_USERNAME;
const password = process.env.ATLAS_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@testing.lcn9q.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(uri)
.then(() => console.log(`Successfully connected to ${dbName} ✅`))
.catch(()=> console.log(`Failed to connect to ${dbName} ❌`));