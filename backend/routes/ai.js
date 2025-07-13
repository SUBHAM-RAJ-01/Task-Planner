const express = require('express');
const router = express.Router();
const axios = require('axios');

// Hugging Face API configuration
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// AI Task Parsing and Classification
router.post('/parse-task', async (req, res) => {
  try {
    const { taskDescription } = req.body;
    
    if (!taskDescription) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    // Use Hugging Face API for task classification
    const classificationResponse = await axios.post(
      `${HUGGINGFACE_API_URL}/facebook/bart-large-mnli`,
      {
        inputs: taskDescription,
        parameters: {
          candidate_labels: [
            'work task',
            'personal task', 
            'meeting',
            'deadline',
            'health and fitness',
            'learning and education',
            'social event',
            'errand'
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract priority keywords
    const priorityKeywords = ['urgent', 'important', 'critical', 'asap', 'deadline', 'due'];
    const priorityScore = priorityKeywords.reduce((score, keyword) => {
      return score + (taskDescription.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);

    // Estimate time based on task complexity
    const timeEstimation = await estimateTaskTime(taskDescription);

    // Determine priority level
    let priority = 'medium';
    if (priorityScore >= 3) priority = 'high';
    else if (priorityScore === 0) priority = 'low';

    // Extract date and time from natural language
    const extractedDateTime = extractDateTimeFromText(taskDescription);
    
    // Generate scheduled time based on extracted date/time
    const scheduledTime = generateScheduledTime(extractedDateTime, taskDescription);

    const parsedTask = {
      title: extractTaskTitle(taskDescription),
      description: taskDescription,
      category: classificationResponse.data.labels[0],
      priority: priority,
      estimatedTime: timeEstimation,
      confidence: classificationResponse.data.scores[0],
      extractedDate: extractedDateTime.date,
      extractedTime: extractedDateTime.time,
      scheduledTime: scheduledTime,
      dueDate: extractedDateTime.dueDate,
      reminderTime: generateReminderTime(scheduledTime)
    };

    res.json(parsedTask);
  } catch (error) {
    console.error('AI task parsing error:', error);
    res.status(500).json({ error: 'Failed to parse task with AI' });
  }
});

// AI Task Scheduling Suggestions
router.post('/suggest-schedule', async (req, res) => {
  try {
    const { task, userContext } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task information is required' });
    }

    // Analyze user's current schedule and preferences
    const scheduleAnalysis = await analyzeUserSchedule(userContext);
    
    // Generate optimal scheduling suggestions
    const suggestions = await generateScheduleSuggestions(task, scheduleAnalysis);

    res.json({
      suggestions,
      reasoning: suggestions.reasoning,
      confidence: suggestions.confidence
    });
  } catch (error) {
    console.error('AI scheduling error:', error);
    res.status(500).json({ error: 'Failed to generate scheduling suggestions' });
  }
});

// Schedule automatic notification for task
router.post('/schedule-notification', async (req, res) => {
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
      createdAt: new Date()
    };

    // Here you would typically store this in a database
    // For now, we'll simulate storing it
    console.log('Scheduling notification:', scheduledNotification);

    res.json({
      success: true,
      notification: scheduledNotification,
      message: 'Notification scheduled successfully'
    });
  } catch (error) {
    console.error('Notification scheduling error:', error);
    res.status(500).json({ error: 'Failed to schedule notification' });
  }
});

// AI Productivity Analysis
router.post('/analyze-productivity', async (req, res) => {
  try {
    const { tasks, events, timeRange } = req.body;

    // Analyze task completion patterns
    const completionAnalysis = await analyzeTaskCompletion(tasks);
    
    // Identify productivity patterns
    const productivityPatterns = await identifyProductivityPatterns(tasks, events);
    
    // Generate optimization recommendations
    const recommendations = await generateOptimizationRecommendations(
      completionAnalysis, 
      productivityPatterns
    );

    res.json({
      analysis: {
        completionRate: completionAnalysis.rate,
        averageTaskTime: completionAnalysis.avgTime,
        peakProductivityHours: productivityPatterns.peakHours,
        commonDistractions: productivityPatterns.distractions
      },
      recommendations: recommendations
    });
  } catch (error) {
    console.error('AI productivity analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze productivity' });
  }
});

// Helper Functions

async function estimateTaskTime(taskDescription) {
  try {
    // Use Hugging Face API for time estimation
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/microsoft/DialoGPT-medium`,
      {
        inputs: `How long does this task take: ${taskDescription}`,
        parameters: {
          max_length: 50,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse time estimation from response
    const timeText = response.data[0].generated_text;
    return parseTimeFromText(timeText);
  } catch (error) {
    console.error('Time estimation error:', error);
    return 60; // Default 1 hour
  }
}

function extractTaskTitle(description) {
  // Simple extraction - first sentence or first 50 characters
  const sentences = description.split(/[.!?]/);
  return sentences[0].trim().substring(0, 50);
}

// Enhanced date and time extraction from natural language
function extractDateTimeFromText(text) {
  const lowerText = text.toLowerCase();
  const now = new Date();
  
  let extractedDate = null;
  let extractedTime = null;
  let dueDate = null;
  
  // Extract specific dates
  const datePatterns = [
    // Specific dates: "January 15th", "15th January", "Jan 15"
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/gi,
    /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)/gi,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})/gi,
    // Date formats: "15/01/2024", "15-01-2024"
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    // Relative dates
    /(today|tomorrow|next week|next month|this week|this month)/gi
  ];
  
  // Extract time patterns
  const timePatterns = [
    // Specific times: "3pm", "3:30pm", "15:30"
    /(\d{1,2}):(\d{2})\s*(am|pm)/gi,
    /(\d{1,2})\s*(am|pm)/gi,
    /(\d{1,2}):(\d{2})/g,
    // Time periods
    /(morning|afternoon|evening|night|noon|midnight)/gi
  ];
  
  // Check for specific dates
  for (const pattern of datePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      extractedDate = parseDateFromMatch(match, now);
      break;
    }
  }
  
  // Check for specific times
  for (const pattern of timePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      extractedTime = parseTimeFromMatch(match);
      break;
    }
  }
  
  // Check for relative dates
  if (lowerText.includes('today')) {
    extractedDate = now;
  } else if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    extractedDate = tomorrow;
  } else if (lowerText.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    extractedDate = nextWeek;
  } else if (lowerText.includes('next month')) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    extractedDate = nextMonth;
  }
  
  // Check for due dates
  if (lowerText.includes('due') || lowerText.includes('deadline')) {
    dueDate = extractedDate || extractedTime ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null;
  }
  
  return {
    date: extractedDate,
    time: extractedTime,
    dueDate: dueDate
  };
}

function parseDateFromMatch(match, now) {
  const monthNames = {
    'january': 0, 'jan': 0, 'february': 1, 'feb': 1, 'march': 2, 'mar': 2,
    'april': 3, 'apr': 3, 'may': 4, 'june': 5, 'jun': 5, 'july': 6, 'jul': 6,
    'august': 7, 'aug': 7, 'september': 8, 'sep': 8, 'october': 9, 'oct': 9,
    'november': 10, 'nov': 10, 'december': 11, 'dec': 11
  };
  
  if (match[0].includes('/') || match[0].includes('-')) {
    // Format: DD/MM/YYYY or DD-MM-YYYY
    const parts = match[0].split(/[\/\-]/);
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  } else {
    // Format: Month Day or Day Month
    const parts = match[0].split(/\s+/);
    if (parts.length >= 2) {
      const month = monthNames[parts[0].toLowerCase()] || monthNames[parts[1].toLowerCase()];
      const day = parseInt(parts[1]) || parseInt(parts[0]);
      return new Date(now.getFullYear(), month, day);
    }
  }
  
  return now;
}

function parseTimeFromMatch(match) {
  if (match[0].includes(':')) {
    // Format: HH:MM AM/PM
    const time = match[0].toLowerCase();
    const [timePart, period] = time.split(/\s+/);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let adjustedHours = hours;
    if (period === 'pm' && hours !== 12) adjustedHours += 12;
    if (period === 'am' && hours === 12) adjustedHours = 0;
    
    return { hours: adjustedHours, minutes: minutes || 0 };
  } else if (match[0].includes('am') || match[0].includes('pm')) {
    // Format: HH AM/PM
    const time = match[0].toLowerCase();
    const [hours, period] = time.split(/\s+/);
    let adjustedHours = parseInt(hours);
    
    if (period === 'pm' && adjustedHours !== 12) adjustedHours += 12;
    if (period === 'am' && adjustedHours === 12) adjustedHours = 0;
    
    return { hours: adjustedHours, minutes: 0 };
  } else if (match[0].includes(':')) {
    // Format: HH:MM (24-hour)
    const [hours, minutes] = match[0].split(':').map(Number);
    return { hours, minutes };
  }
  
  return null;
}

function generateScheduledTime(extractedDateTime, taskDescription) {
  const now = new Date();
  let scheduledTime = new Date(now);
  
  // If we have a specific date, use it
  if (extractedDateTime.date) {
    scheduledTime = new Date(extractedDateTime.date);
  }
  
  // If we have a specific time, set it
  if (extractedDateTime.time) {
    scheduledTime.setHours(extractedDateTime.time.hours, extractedDateTime.time.minutes, 0, 0);
  } else {
    // Default to next hour if no time specified
    scheduledTime.setHours(now.getHours() + 1, 0, 0, 0);
  }
  
  // If the scheduled time is in the past, move to next day
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  return scheduledTime;
}

function generateReminderTime(scheduledTime) {
  // Set reminder 30 minutes before scheduled time
  const reminderTime = new Date(scheduledTime.getTime() - (30 * 60 * 1000));
  return reminderTime;
}

function parseTimeFromText(timeText) {
  // Convert time text to minutes
  const timePatterns = {
    'hour': 60,
    'hours': 60,
    'minute': 1,
    'minutes': 1,
    'day': 1440,
    'days': 1440
  };
  
  const lowerText = timeText.toLowerCase();
  for (const [pattern, minutes] of Object.entries(timePatterns)) {
    if (lowerText.includes(pattern)) {
      const numberMatch = lowerText.match(/(\d+)/);
      if (numberMatch) {
        return parseInt(numberMatch[1]) * minutes;
      }
    }
  }
  
  return 60; // Default 1 hour
}

async function analyzeUserSchedule(userContext) {
  // Analyze user's current tasks, events, and preferences
  const { tasks, events, preferences } = userContext;
  
  return {
    busyHours: extractBusyHours(events),
    preferredHours: preferences?.preferredHours || [9, 10, 11, 14, 15, 16],
    taskComplexity: calculateTaskComplexity(tasks),
    availableSlots: findAvailableSlots(events)
  };
}

async function generateScheduleSuggestions(task, scheduleAnalysis) {
  const { busyHours, preferredHours, availableSlots } = scheduleAnalysis;
  
  // Generate optimal scheduling suggestions
  const suggestions = [];
  
  // Find best time slots
  for (const slot of availableSlots) {
    if (preferredHours.includes(slot.hour) && !busyHours.includes(slot.hour)) {
      suggestions.push({
        time: slot,
        reason: 'Optimal productivity hour',
        confidence: 0.9
      });
    }
  }
  
  return {
    suggestions: suggestions.slice(0, 3), // Top 3 suggestions
    reasoning: 'Based on your productivity patterns and current schedule',
    confidence: 0.85
  };
}

async function analyzeTaskCompletion(tasks) {
  const completedTasks = tasks.filter(task => task.completed);
  const totalTasks = tasks.length;
  
  return {
    rate: totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0,
    avgTime: calculateAverageTaskTime(completedTasks),
    patterns: identifyCompletionPatterns(completedTasks)
  };
}

async function identifyProductivityPatterns(tasks, events) {
  // Analyze when user is most productive
  const taskHours = tasks.map(task => new Date(task.completedAt).getHours());
  const peakHours = findPeakHours(taskHours);
  
  return {
    peakHours,
    distractions: identifyDistractions(tasks),
    optimalWorkBlocks: calculateOptimalWorkBlocks(tasks)
  };
}

async function generateOptimizationRecommendations(completionAnalysis, productivityPatterns) {
  const recommendations = [];
  
  if (completionAnalysis.rate < 70) {
    recommendations.push({
      type: 'productivity',
      title: 'Improve Task Completion Rate',
      description: 'Consider breaking down complex tasks into smaller, manageable pieces',
      priority: 'high'
    });
  }
  
  if (productivityPatterns.peakHours.length < 3) {
    recommendations.push({
      type: 'schedule',
      title: 'Optimize Your Schedule',
      description: 'Schedule important tasks during your peak productivity hours',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

// Helper functions for analysis
function extractBusyHours(events) {
  return events.map(event => new Date(event.start).getHours());
}

function calculateTaskComplexity(tasks) {
  return tasks.reduce((complexity, task) => {
    return complexity + (task.priority === 'high' ? 2 : task.priority === 'medium' ? 1 : 0);
  }, 0);
}

function findAvailableSlots(events) {
  // Generate available time slots
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    if (!events.some(event => new Date(event.start).getHours() === hour)) {
      slots.push({ hour, available: true });
    }
  }
  return slots;
}

function findPeakHours(taskHours) {
  const hourCounts = {};
  taskHours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  return Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
}

function calculateAverageTaskTime(completedTasks) {
  if (completedTasks.length === 0) return 0;
  
  const totalTime = completedTasks.reduce((total, task) => {
    const startTime = new Date(task.createdAt);
    const endTime = new Date(task.completedAt);
    return total + (endTime - startTime);
  }, 0);
  
  return totalTime / completedTasks.length / (1000 * 60); // Convert to minutes
}

function identifyCompletionPatterns(completedTasks) {
  // Analyze patterns in task completion
  const patterns = {
    byDay: {},
    byHour: {},
    byPriority: {}
  };
  
  completedTasks.forEach(task => {
    const date = new Date(task.completedAt);
    const day = date.getDay();
    const hour = date.getHours();
    const priority = task.priority;
    
    patterns.byDay[day] = (patterns.byDay[day] || 0) + 1;
    patterns.byHour[hour] = (patterns.byHour[hour] || 0) + 1;
    patterns.byPriority[priority] = (patterns.byPriority[priority] || 0) + 1;
  });
  
  return patterns;
}

function identifyDistractions(tasks) {
  // Identify potential distractions based on task patterns
  const distractions = [];
  
  // Check for frequent task switching
  const taskSwitching = analyzeTaskSwitching(tasks);
  if (taskSwitching.rate > 0.5) {
    distractions.push('Frequent task switching');
  }
  
  // Check for incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  if (incompleteTasks.length > tasks.length * 0.3) {
    distractions.push('Too many incomplete tasks');
  }
  
  return distractions;
}

function analyzeTaskSwitching(tasks) {
  // Analyze how often user switches between tasks
  let switches = 0;
  for (let i = 1; i < tasks.length; i++) {
    if (tasks[i].category !== tasks[i-1].category) {
      switches++;
    }
  }
  
  return {
    rate: switches / Math.max(tasks.length - 1, 1),
    totalSwitches: switches
  };
}

function calculateOptimalWorkBlocks(tasks) {
  // Calculate optimal work block durations
  const workBlocks = [];
  let currentBlock = { start: null, duration: 0 };
  
  tasks.forEach(task => {
    if (task.completed) {
      const completionTime = new Date(task.completedAt);
      
      if (!currentBlock.start) {
        currentBlock.start = completionTime;
      }
      
      currentBlock.duration += 1; // Add 1 hour for each completed task
    } else {
      if (currentBlock.start) {
        workBlocks.push({ ...currentBlock });
        currentBlock = { start: null, duration: 0 };
      }
    }
  });
  
  return workBlocks;
}

module.exports = router; 