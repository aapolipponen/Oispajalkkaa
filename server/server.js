require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const knex = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/scores', async (req, res) => {
  try {
    const scores = await knex('scores')
      .orderBy('score', 'desc')
      .limit(10);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/scores', async (req, res) => {
  const { name, score } = req.body;
  
  if (!name || !score || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const [newScore] = await knex('scores').insert({
      name: name.substring(0, 20),
      score: Math.min(score, 9999999)
    }).returning('*');
    
    res.status(201).json(newScore);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Scoreboard server running on port ${port}`);
});