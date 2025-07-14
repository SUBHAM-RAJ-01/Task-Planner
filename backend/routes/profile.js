const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');

// In-memory notification settings (replace with DB in production)
const notificationSettings = {};
const db = admin.firestore();

// Get user profile and notification settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();
    let userProfile = doc.exists ? doc.data() : {};
    // Fallback to Firebase Auth for email/displayName if not set
    const userRecord = await admin.auth().getUser(req.user.uid);
    userProfile = {
      email: userProfile.email || userRecord.email,
      displayName: userProfile.displayName || userRecord.displayName,
      photoURL: userProfile.photoURL || userRecord.photoURL || '',
      bio: userProfile.bio || '',
      ...userProfile
    };
    const settings = notificationSettings[req.user.uid] || { email: true, push: true };
    res.json({
      user: {
        uid: req.user.uid,
        ...userProfile
      },
      notificationSettings: settings,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user profile (displayName, bio, photoURL)
router.put('/', authenticateToken, async (req, res) => {
  const { displayName, bio, photoURL, email, notificationSettings: newSettings } = req.body;
  try {
    // Update Firestore profile
    await db.collection('users').doc(req.user.uid).set(
      { displayName, bio, photoURL, email },
      { merge: true }
    );
    // Optionally update Firebase Auth displayName/email
    if (displayName || email) {
      await admin.auth().updateUser(req.user.uid, {
        ...(displayName ? { displayName } : {}),
        ...(email ? { email } : {})
      });
    }
    if (newSettings) {
      notificationSettings[req.user.uid] = {
        ...notificationSettings[req.user.uid],
        ...newSettings,
      };
    }
    const doc = await db.collection('users').doc(req.user.uid).get();
    const userProfile = doc.data();
    res.json({
      user: {
        uid: req.user.uid,
        ...userProfile
      },
      notificationSettings: notificationSettings[req.user.uid] || { email: true, push: true },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 