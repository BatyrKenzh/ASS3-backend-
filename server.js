const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectID } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'blogDB';
const COLLECTION_NAME = 'blogs';

app.use(bodyParser.json());

// MongoDB Connection
MongoClient.connect(MONGO_URL, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  // POST /blogs: To create a new blog post
  app.post('/blogs', async (req, res) => {
    const { title, body, author } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const newBlog = { title, body, author, createdAt: new Date(), updatedAt: new Date() };
    try {
      const result = await collection.insertOne(newBlog);
      res.status(201).json(result.ops[0]);
    } catch (err) {
      console.error('Error creating blog:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /blogs: To retrieve all blog posts
  app.get('/blogs', async (req, res) => {
    try {
      const blogs = await collection.find({}).toArray();
      res.json(blogs);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /blogs/:id: To retrieve a single blog post by ID
  app.get('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const blog = await collection.findOne({ _id: ObjectID(id) });
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      res.json(blog);
    } catch (err) {
      console.error('Error fetching blog:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /blogs/:id: To update a blog post by ID
  app.put('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    try {
      const result = await collection.updateOne(
        { _id: ObjectID(id) },
        { $set: { title, body, updatedAt: new Date() } }
      );
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      res.json({ message: 'Blog updated successfully' });
    } catch (err) {
      console.error('Error updating blog:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /blogs/:id: To delete a blog post by ID
  app.delete('/blogs/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await collection.deleteOne({ _id: ObjectID(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
      console.error('Error deleting blog:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
