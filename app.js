const express = require("express");
const app = express();
const redis = require("redis");
const dbConnection = require("./helper/mysql");

dbConnection.getConnection((err, connection) => {
    if (err) {
      console.log("Database connection error: ", err);
    } else {
      console.log("Database connected.");
    }
  });

const redis_client = redis.createClient({
    host: "localhost",
    port: 6379
});

redis_client.on('error', (err) => console.log('Redis Client Error', err));
redis_client.connect();

app.get('/', async (req, res) => {
    try {
        //const data = await redis_client.get("dora");
        console.log(data);
        res.send('Hello world!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
/*
async function insertBlogPost() {
    const now = new Date();
    const createdAt = now.toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:MM:SS'
    const updatedAt = createdAt; // For a new record, updated_at is the same as created_at
    const title = "Redis App", author = "doraacik", content = "devops";
    const query = 'INSERT INTO blogs (title, author, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
    const result = await dbConnection.query(query, [title, author, content, createdAt, updatedAt]);
    return result[0].insertId; // Return the ID of the inserted record
}
insertBlogPost();*/

app.get("/blogs/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      // Check if data exists in Redis cache first
      const cachedData = await redis_client.get(id);
  
      if (cachedData) {
        console.log("Data found in cache.");
        res.json(JSON.parse(cachedData)); //responds with cached data
      } else {
        // otherwise fetching data from my redis-blog-db by id
        const [rows] = await dbConnection.query("SELECT * FROM blogs WHERE id = ?", [id]);
  
        if (rows.length > 0) {
          // to make its access easier and fast cache the data in redis.
          await redis_client.set(id, JSON.stringify(rows[0]));
          console.log("Data fetched from MySQL and set in cache.");
          res.json(rows[0]);
        } else {
          console.log("Data not found");
          res.status(404).send("Data not found");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
app.listen(3000, () => {
    console.log("Server is running on port 3000 :)))")
});

