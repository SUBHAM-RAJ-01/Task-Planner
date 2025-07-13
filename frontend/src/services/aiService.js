const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

class AIService {
  // Parse task description using AI
  static async parseTask(taskDescription) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/parse-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskDescription })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI parsing failed: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI task parsing error:', error);
      throw new Error(`AI parsing failed: ${error.message}`);
    }
  }

  // Get AI scheduling suggestions
  static async getScheduleSuggestions(task, userContext) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/suggest-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task, userContext })
      });

      if (!response.ok) {
        throw new Error('Failed to get scheduling suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('AI scheduling error:', error);
      throw error;
    }
  }

  // Create smart task with AI assistance and automatic notifications
  static async createSmartTask(taskInput, userPreferences = {}) {
    try {
      // First, parse the task with AI
      const parsedTask = await this.parseTask(taskInput);
      
      // Get scheduling suggestions
      const userContext = {
        tasks: [], // Will be populated from current state
        events: [], // Will be populated from current state
        preferences: {
          preferredHours: userPreferences.preferredHours || [9, 10, 11, 14, 15, 16],
          notificationAdvance: userPreferences.notificationAdvance || 30, // 30 minutes default
          workHours: userPreferences.workHours || { start: 9, end: 17 }
        }
      };
      
      const scheduleSuggestions = await this.getScheduleSuggestions(parsedTask, userContext);
      
      // Generate optimal schedule with notification timing
      const optimalSchedule = this.generateOptimalSchedule(parsedTask, scheduleSuggestions, userContext);
      
      return {
        ...parsedTask,
        scheduleSuggestions,
        optimalSchedule,
        notificationSchedule: this.generateNotificationSchedule(optimalSchedule, userContext.preferences.notificationAdvance)
      };
    } catch (error) {
      console.error('Smart task creation error:', error);
      throw error;
    }
  }

  // Generate optimal schedule based on AI suggestions
  static generateOptimalSchedule(parsedTask, scheduleSuggestions, userContext) {
    const { suggestions } = scheduleSuggestions;
    const { workHours } = userContext.preferences;
    
    if (suggestions && suggestions.length > 0) {
      // Use the highest confidence suggestion
      const bestSuggestion = suggestions.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      return {
        scheduledTime: bestSuggestion.time,
        reason: bestSuggestion.reason,
        confidence: bestSuggestion.confidence
      };
    }
    
    // Fallback: schedule for next available work hour
    const now = new Date();
    const currentHour = now.getHours();
    let scheduledHour = currentHour + 1;
    
    // Ensure it's within work hours
    if (scheduledHour < workHours.start) {
      scheduledHour = workHours.start;
    } else if (scheduledHour >= workHours.end) {
      // Schedule for next day
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(workHours.start, 0, 0, 0);
      return {
        scheduledTime: tomorrow,
        reason: 'Scheduled for next available work day',
        confidence: 0.7
      };
    }
    
    const scheduledTime = new Date(now);
    scheduledTime.setHours(scheduledHour, 0, 0, 0);
    
    return {
      scheduledTime,
      reason: 'Scheduled for next available hour',
      confidence: 0.8
    };
  }

  // Generate notification schedule
  static generateNotificationSchedule(optimalSchedule, advanceMinutes = 30) {
    const { scheduledTime } = optimalSchedule;
    const notificationTime = new Date(scheduledTime.getTime() - (advanceMinutes * 60 * 1000));
    
    return {
      notificationTime,
      advanceMinutes,
      message: `Your task "${optimalSchedule.title || 'Task'}" is scheduled to start in ${advanceMinutes} minutes`,
      type: 'reminder'
    };
  }

  // Schedule automatic notification
  static async scheduleNotification(taskId, notificationSchedule) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          taskId,
          notificationTime: notificationSchedule.notificationTime,
          message: notificationSchedule.message,
          type: notificationSchedule.type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Notification scheduling error:', error);
      throw error;
    }
  }

  // Analyze productivity patterns
  static async analyzeProductivity(tasks, events, timeRange) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-productivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tasks, events, timeRange })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze productivity');
      }

      return await response.json();
    } catch (error) {
      console.error('AI productivity analysis error:', error);
      throw error;
    }
  }

  // Get AI-powered insights
  static async getInsights(tasks, events) {
    try {
      const productivityAnalysis = await this.analyzeProductivity(tasks, events, 'week');
      
      return {
        productivity: productivityAnalysis.analysis,
        recommendations: productivityAnalysis.recommendations,
        insights: this.generateInsights(productivityAnalysis)
      };
    } catch (error) {
      console.error('AI insights error:', error);
      throw error;
    }
  }

  // Generate human-readable insights
  static generateInsights(analysis) {
    const insights = [];
    
    if (analysis.analysis.completionRate < 70) {
      insights.push({
        type: 'warning',
        title: 'Task Completion Rate',
        message: `Your task completion rate is ${analysis.analysis.completionRate.toFixed(1)}%. Consider breaking down complex tasks into smaller, manageable pieces.`,
        priority: 'high'
      });
    }
    
    if (analysis.analysis.peakProductivityHours.length > 0) {
      insights.push({
        type: 'info',
        title: 'Peak Productivity Hours',
        message: `You're most productive during hours: ${analysis.analysis.peakProductivityHours.join(', ')}. Schedule important tasks during these times.`,
        priority: 'medium'
      });
    }
    
    if (analysis.analysis.commonDistractions.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Potential Distractions',
        message: `Common distractions identified: ${analysis.analysis.commonDistractions.join(', ')}. Consider using focus techniques.`,
        priority: 'medium'
      });
    }
    
    return insights;
  }

  // Smart task prioritization
  static async prioritizeTasks(tasks) {
    try {
      const prioritizedTasks = await Promise.all(
        tasks.map(async (task) => {
          const parsedTask = await this.parseTask(task.title);
          return {
            ...task,
            aiPriority: parsedTask.priority,
            estimatedTime: parsedTask.estimatedTime,
            confidence: parsedTask.confidence
          };
        })
      );
      
      // Sort by AI priority and confidence
      return prioritizedTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aScore = priorityOrder[a.aiPriority] * a.confidence;
        const bScore = priorityOrder[b.aiPriority] * b.confidence;
        return bScore - aScore;
      });
    } catch (error) {
      console.error('Task prioritization error:', error);
      return tasks; // Return original tasks if AI fails
    }
  }

  // Smart time estimation
  static async estimateTaskTime(taskDescription) {
    try {
      const parsedTask = await this.parseTask(taskDescription);
      return parsedTask.estimatedTime;
    } catch (error) {
      console.error('Time estimation error:', error);
      return 60; // Default 1 hour
    }
  }

  // Smart category suggestion
  static async suggestCategory(taskDescription) {
    try {
      const parsedTask = await this.parseTask(taskDescription);
      return parsedTask.category;
    } catch (error) {
      console.error('Category suggestion error:', error);
      return 'work task'; // Default category
    }
  }

  // Smart deadline suggestion
  static async suggestDeadline(taskDescription, priority) {
    try {
      const parsedTask = await this.parseTask(taskDescription);
      const extractedDate = parsedTask.extractedDate;
      
      if (extractedDate) {
        return new Date(extractedDate);
      }
      
      // Default deadline based on priority
      const today = new Date();
      const daysToAdd = priority === 'high' ? 1 : priority === 'medium' ? 3 : 7;
      return new Date(today.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    } catch (error) {
      console.error('Deadline suggestion error:', error);
      const today = new Date();
      return new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days default
    }
  }

  // Create task from natural language with automatic scheduling
  static async createTaskFromNaturalLanguage(naturalLanguageInput, userPreferences = {}) {
    try {
      console.log('Creating task from natural language:', naturalLanguageInput);
      
      // Parse task with AI
      const parsedTask = await this.parseTask(naturalLanguageInput);
      
      console.log('Parsed task:', parsedTask);
      
      // Create the actual task object
      const task = {
        id: Date.now() + Math.random(),
        title: parsedTask.title,
        description: parsedTask.description || naturalLanguageInput,
        category: parsedTask.category || 'work task',
        priority: parsedTask.priority || 'medium',
        estimatedTime: parsedTask.estimatedTime || 60,
        scheduledTime: parsedTask.scheduledTime ? new Date(parsedTask.scheduledTime) : null,
        dueDate: parsedTask.dueDate ? new Date(parsedTask.dueDate) : null,
        completed: false,
        createdAt: new Date().toISOString(),
        aiGenerated: true,
        aiConfidence: parsedTask.confidence || 0.8,
        // Add extracted date/time information
        extractedDate: parsedTask.extractedDate,
        extractedTime: parsedTask.extractedTime,
        reminderTime: parsedTask.reminderTime ? new Date(parsedTask.reminderTime) : null
      };
      
      // Schedule notification if we have a scheduled time
      let notificationScheduled = false;
      if (task.scheduledTime && task.reminderTime) {
        try {
          await this.scheduleNotification(task.id, {
            notificationTime: task.reminderTime,
            message: `Reminder: Your task "${task.title}" is scheduled to start in 30 minutes`,
            type: 'reminder'
          });
          notificationScheduled = true;
        } catch (error) {
          console.warn('Failed to schedule notification:', error);
        }
      }
      
      // Create AI analysis object
      const aiAnalysis = {
        category: parsedTask.category,
        priority: parsedTask.priority,
        estimatedTime: parsedTask.estimatedTime,
        confidence: parsedTask.confidence,
        scheduledTime: parsedTask.scheduledTime,
        extractedDate: parsedTask.extractedDate,
        extractedTime: parsedTask.extractedTime,
        notificationScheduled: notificationScheduled
      };
      
      return {
        task,
        aiAnalysis,
        notificationScheduled
      };
      
    } catch (error) {
      console.error('Error creating task from natural language:', error);
      
      // Fallback: create basic task without AI
      const fallbackTask = this.createFallbackTask(naturalLanguageInput, userPreferences);
      
      return {
        task: fallbackTask,
        aiAnalysis: {
          category: 'work task',
          priority: 'medium',
          estimatedTime: 60,
          confidence: 0.5,
          scheduledTime: null,
          extractedDate: null,
          extractedTime: null,
          notificationScheduled: false
        },
        notificationScheduled: false
      };
    }
  }

  // Create fallback task when AI fails
  static createFallbackTask(naturalLanguageInput, userPreferences = {}) {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    
    return {
      id: Date.now() + Math.random(),
      title: naturalLanguageInput.substring(0, 50),
      description: naturalLanguageInput,
      category: 'work task',
      priority: 'medium',
      estimatedTime: 60,
      scheduledTime: nextHour,
      dueDate: null,
      completed: false,
      createdAt: new Date().toISOString(),
      aiGenerated: false,
      aiConfidence: 0.5,
      extractedDate: null,
      extractedTime: null,
      reminderTime: null
    };
  }
}

export default AIService; 