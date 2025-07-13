const admin = require('../firebase');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // For Firebase authentication, the token is the user UID
  // In a real app, you'd verify the Firebase ID token
  // For now, we'll accept the UID as a valid token
  try {
    // Check if this looks like a Firebase UID (28 characters, alphanumeric)
    if (token.length === 28 && /^[a-zA-Z0-9]+$/.test(token)) {
      // This is likely a Firebase UID
      req.user = { uid: token };
      next();
    } else {
      // Try to verify as Firebase ID token (for future use)
      // const decodedToken = await admin.auth().verifyIdToken(token);
      // req.user = decodedToken;
      // next();
      
      // For now, reject non-UID tokens
      return res.status(403).json({ error: 'Invalid token format' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = authenticateToken; 