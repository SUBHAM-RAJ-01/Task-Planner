// Data migration utilities for handling format changes

export const migrateTaskData = (tasks) => {
  if (!Array.isArray(tasks)) return [];
  
  return tasks.map(task => ({
    id: task.id || Date.now() + Math.random(),
    title: task.title || 'Untitled Task',
    description: task.description || '',
    priority: task.priority || 'medium',
    dueDate: task.dueDate || new Date().toISOString().split('T')[0],
    completed: task.completed || false,
    createdAt: task.createdAt || new Date().toISOString(),
    // Add any new fields with defaults
    category: task.category || 'general',
    estimatedTime: task.estimatedTime || 60,
    aiGenerated: task.aiGenerated || false,
    aiConfidence: task.aiConfidence || 0
  }));
};

export const migrateEventData = (events) => {
  if (!Array.isArray(events)) return [];
  
  return events.map(event => ({
    id: event.id || Date.now() + Math.random(),
    title: event.title || 'Untitled Event',
    start: event.start || new Date().toISOString(),
    end: event.end || new Date().toISOString(),
    description: event.description || '',
    location: event.location || '',
    type: event.type || 'event',
    // Add any new fields with defaults
    color: event.color || '#667eea',
    allDay: event.allDay || false
  }));
};

export const migrateNotificationData = (notifications) => {
  if (!Array.isArray(notifications)) return [];
  
  return notifications.map(notification => ({
    id: notification.id || Date.now() + Math.random(),
    title: notification.title || 'Notification',
    message: notification.message || '',
    type: notification.type || 'info',
    timestamp: notification.timestamp || new Date().toISOString(),
    read: notification.read || false,
    // Add any new fields with defaults
    priority: notification.priority || 'normal',
    category: notification.category || 'general'
  }));
};

export const migrateProfileData = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: 'Productivity enthusiast and goal achiever.',
      timezone: 'UTC-5',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    };
  }
  
  return {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    bio: profile.bio || 'Productivity enthusiast and goal achiever.',
    timezone: profile.timezone || 'UTC-5',
    notifications: {
      email: profile.notifications?.email ?? true,
      push: profile.notifications?.push ?? true,
      sms: profile.notifications?.sms ?? false
    },
    // Add any new fields with defaults
    displayName: profile.displayName || '',
    avatar: profile.avatar || '',
    preferences: profile.preferences || {}
  };
};

export const migrateStatsData = (stats) => {
  if (!stats || typeof stats !== 'object') {
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      totalEvents: 0,
      upcomingEvents: 0,
      productivity: 0
    };
  }
  
  return {
    totalTasks: stats.totalTasks || 0,
    completedTasks: stats.completedTasks || 0,
    pendingTasks: stats.pendingTasks || 0,
    totalEvents: stats.totalEvents || 0,
    upcomingEvents: stats.upcomingEvents || 0,
    productivity: stats.productivity || 0,
    // Add any new fields with defaults
    streak: stats.streak || 0,
    weeklyGoal: stats.weeklyGoal || 0,
    monthlyGoal: stats.monthlyGoal || 0
  };
};

// Check if data needs migration
export const needsMigration = (data, version = 1) => {
  return !data || !data._version || data._version < version;
};

// Apply migration to data
export const applyMigration = (data, type, version = 1) => {
  if (!needsMigration(data, version)) return data;
  
  switch (type) {
    case 'tasks':
      return { data: migrateTaskData(data), _version: version };
    case 'events':
      return { data: migrateEventData(data), _version: version };
    case 'notifications':
      return { data: migrateNotificationData(data), _version: version };
    case 'profile':
      return { data: migrateProfileData(data), _version: version };
    case 'stats':
      return { data: migrateStatsData(data), _version: version };
    default:
      return data;
  }
}; 