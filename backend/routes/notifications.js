const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const authenticateToken = require('../middleware/auth');

// Send push notification via FCM
router.post('/send', authenticateToken, async (req, res) => {
  const { title, body, token } = req.body;
  if (!token) return res.status(400).json({ error: 'FCM device token required' });
  try {
    const message = {
      notification: { title, body },
      token,
    };
    const response = await admin.messaging().send(message);
    res.json({ message: 'Notification sent', response });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification', details: err.message });
  }
});

// Schedule notification for task
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { taskId, notificationTime, message, type } = req.body;
    
    if (!taskId || !notificationTime || !message) {
      return res.status(400).json({ error: 'Task ID, notification time, and message are required' });
    }

    // Calculate notification time (30 minutes before task)
    const taskTime = new Date(notificationTime);
    const scheduledNotificationTime = new Date(taskTime.getTime() - (30 * 60 * 1000)); // 30 minutes before
    
    // Store notification in database or queue
    const scheduledNotification = {
      taskId,
      notificationTime: scheduledNotificationTime,
      message,
      type: type || 'reminder',
      status: 'scheduled',
      createdAt: new Date(),
      userId: req.user.uid
    };

    // Here you would typically store this in a database
    // For now, we'll simulate storing it
    console.log('Scheduling notification:', scheduledNotification);

    // Schedule the actual notification using setTimeout (for demo purposes)
    // In production, you'd use a proper job queue like Bull or Agenda
    const timeUntilNotification = scheduledNotificationTime.getTime() - Date.now();
    
    if (timeUntilNotification > 0) {
      setTimeout(async () => {
        try {
          // Get user's FCM token from database
          const userToken = req.body.fcmToken || 'demo-token';
          
          const message = {
            notification: { 
              title: 'Task Reminder', 
              body: scheduledNotification.message 
            },
            token: userToken,
          };
          
          await admin.messaging().send(message);
          console.log('Scheduled notification sent successfully');
        } catch (error) {
          console.error('Failed to send scheduled notification:', error);
        }
      }, timeUntilNotification);
    }

    res.json({
      success: true,
      notification: scheduledNotification,
      message: 'Notification scheduled successfully',
      scheduledFor: scheduledNotificationTime
    });
  } catch (error) {
    console.error('Notification scheduling error:', error);
    res.status(500).json({ error: 'Failed to schedule notification' });
  }
});

module.exports = router; 