const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// In-memory event store (replace with DB/Google API in production)
const events = [];
let nextEventId = 1;

// Sync with Google Calendar (placeholder)
router.get('/sync', authenticateToken, (req, res) => {
  // TODO: Implement Google Calendar sync logic
  res.json({ message: 'Google Calendar sync not implemented in demo.' });
});

// Get all events for user
router.get('/events', authenticateToken, (req, res) => {
  const userEvents = events.filter(e => e.userId === req.user.uid);
  res.json({ events: userEvents });
});

// Create event
router.post('/events', authenticateToken, (req, res) => {
  const { title, start, end } = req.body;
  const event = {
    id: nextEventId++,
    userId: req.user.uid,
    title,
    start,
    end,
    createdAt: new Date().toISOString(),
  };
  events.push(event);
  res.status(201).json({ event });
});

// Update event
router.put('/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, start, end } = req.body;
  const event = events.find(e => e.id == id && e.userId === req.user.uid);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (title !== undefined) event.title = title;
  if (start !== undefined) event.start = start;
  if (end !== undefined) event.end = end;
  res.json({ event });
});

// Delete event
router.delete('/events/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const idx = events.findIndex(e => e.id == id && e.userId === req.user.uid);
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });
  events.splice(idx, 1);
  res.json({ message: 'Event deleted' });
});

module.exports = router; 