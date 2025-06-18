
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/query/openai', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: req.body.prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    res.json({ model: 'chatgpt', response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'OpenAI API error' });
  }
});

app.post('/api/query/claude', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: req.body.prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    res.json({ model: 'claude', response: response.data.content[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Claude API error' });
  }
});

app.post('/api/query/gemini', async (req, res) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: req.body.prompt }] }]
      }
    );
    res.json({ model: 'gemini', response: response.data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: 'Gemini API error' });
  }
});

for (let i = 1; i <= 6; i++) {
  app.post(`/api/query/manual${i}`, async (req, res) => {
    const { name, response } = req.body;
    res.json({ model: name || `manual${i}`, response });
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
