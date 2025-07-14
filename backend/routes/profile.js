const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');

// In-memory notification settings (replace with DB in production)
const notificationSettings = {};

// Get user profile and notification settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);
    const settings = notificationSettings[req.user.uid] || { email: true, push: true };
    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      notificationSettings: settings,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update displayName, email, or notification settings
router.put('/', authenticateToken, async (req, res) => {
  const { displayName, email, notificationSettings: newSettings } = req.body;
  try {
    if (displayName) {
      await admin.auth().updateUser(req.user.uid, { displayName });
    }
    if (email) {
      await admin.auth().updateUser(req.user.uid, { email });
    }
    if (newSettings) {
      notificationSettings[req.user.uid] = {
        ...notificationSettings[req.user.uid],
        ...newSettings,
      };
    }
    const userRecord = await admin.auth().getUser(req.user.uid);
    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      notificationSettings: notificationSettings[req.user.uid] || { email: true, push: true },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 