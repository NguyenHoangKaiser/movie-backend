import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
async function main() {
  dotenv.config();
  const uri =
    "mongodb+srv://admin:1DQgkHSIkOEaEJwn@newcluster.srgg8lr.mongodb.net/?retryWrites=true&w=majority";

  const client = new mongodb.MongoClient(uri);
  const port = process.env.PORT || 8000;
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await listDatabases(client);
    
    app.listen(port, () => {
      console.log("server is running on port:" + port);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main().catch(console.error);

async function listDatabases(client){
    let databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};