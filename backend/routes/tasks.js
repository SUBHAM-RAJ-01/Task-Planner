const express = require('express');
const router = express.Router();
const axios = require('axios');
const authenticateToken = require('../middleware/auth');

// Parse natural language task using Hugging Face NLP
router.post('/parse', async (req, res) => {
  const { text } = req.body;
  try {
    // Use a default model for text generation/parsing
    const modelEndpoint = "https://api-inference.huggingface.co/models/gpt2";
    const response = await axios.post(
      modelEndpoint,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );
    res.json({ result: response.data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse task', details: err.message });
  }
});

// In-memory task store (replace with DB in production)
const tasks = [];
let nextId = 1;

// Get all tasks for user
router.get('/', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(t => t.userId === req.user.uid);
  res.json({ tasks: userTasks });
});

// Create new task
router.post('/', authenticateToken, (req, res) => {
  const { 
    title, 
    description, 
    category, 
    priority, 
    estimatedTime, 
    scheduledTime, 
    deadline, 
    aiGenerated, 
    aiConfidence,
    text, 
    parsed 
  } = req.body;
  
  const task = {
    id: nextId++,
    userId: req.user.uid,
    title: title || text || 'Untitled Task',
    description: description || text || '',
    category: category || 'work task',
    priority: priority || 'medium',
    estimatedTime: estimatedTime || 60,
    scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
    deadline: deadline ? new Date(deadline).toISOString() : null,
    aiGenerated: aiGenerated || false,
    aiConfidence: aiConfidence || 0,
    completed: false,
    createdAt: new Date().toISOString(),
    parsed: parsed || null
  };
  
  tasks.push(task);
  res.status(201).json({ task });
});

// Update task
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { text, parsed, completed } = req.body;
  const task = tasks.find(t => t.id == id && t.userId === req.user.uid);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (text !== undefined) task.text = text;
  if (parsed !== undefined) task.parsed = parsed;
  if (completed !== undefined) task.completed = completed;
  res.json({ task });
});

// Delete task
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const idx = tasks.findIndex(t => t.id == id && t.userId === req.user.uid);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(idx, 1);
  res.json({ message: 'Task deleted' });
});

// Analytics endpoint
router.get('/analytics', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(t => t.userId === req.user.uid);
  const total = userTasks.length;
  const completed = userTasks.filter(t => t.completed).length;
  const completionRate = total ? completed / total : 0;
  // Example: count by parsed type if available
  const typeCounts = {};
  userTasks.forEach(t => {
    const type = t.parsed?.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  res.json({ total, completed, completionRate, typeCounts });
});

module.exports = router; 