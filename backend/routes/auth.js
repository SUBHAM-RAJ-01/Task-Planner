const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');

// Register (email/password)
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const token = jwt.sign({ uid: userRecord.uid, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { uid: userRecord.uid, email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login (email/password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Firebase Admin does not support password verification directly; use Firebase Auth REST API
    const apiKey = process.env.FIREBASE_API_KEY;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const token = jwt.sign({ uid: data.localId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { uid: data.localId, email } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Password reset
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    await admin.auth().generatePasswordResetLink(email);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Google OAuth login
router.post('/google', async (req, res) => {
  const { idToken } = req.body; // Google ID token from frontend
  try {
    // Verify Google ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;
    // Issue JWT for session
    const token = jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { uid, email } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google ID token' });
  }
});

// Profile (protected)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);
    res.json({ user: { uid: userRecord.uid, email: userRecord.email, displayName: userRecord.displayName } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 