# AI Task Creation with Automatic Scheduling

## Overview

The AI Task Creator automatically extracts dates, times, and scheduling information from natural language input and creates tasks with proper scheduling and notifications.

## How It Works

### 1. Natural Language Processing
The AI analyzes your task description and extracts:
- **Task title** and description
- **Category** (work task, meeting, personal, etc.)
- **Priority** (high, medium, low)
- **Estimated time** to complete
- **Date and time** information
- **Due dates** and deadlines

### 2. Date/Time Extraction Examples

#### **Specific Dates:**
- ✅ "Review proposal by January 15th"
- ✅ "Submit report by 15/01/2024"
- ✅ "Meeting on Jan 20th"

#### **Relative Dates:**
- ✅ "Call client tomorrow"
- ✅ "Team meeting next week"
- ✅ "Update docs next month"

#### **Specific Times:**
- ✅ "Meeting at 3pm today"
- ✅ "Call at 2:30pm tomorrow"
- ✅ "Review by 10am Friday"

#### **Time Periods:**
- ✅ "Send emails this afternoon"
- ✅ "Prepare presentation tomorrow morning"
- ✅ "Update system tonight"

### 3. Automatic Scheduling

The AI automatically:
1. **Extracts** date/time from your input
2. **Schedules** the task at the appropriate time
3. **Sets reminders** 30 minutes before start time
4. **Categorizes** and prioritizes the task
5. **Estimates** completion time

### 4. Smart Defaults

If no specific time is mentioned:
- Tasks are scheduled for the **next available hour**
- **Work hours** are respected (9 AM - 5 PM)
- **Weekends** are avoided unless specified
- **Past times** are moved to the next day

## Usage Examples

### **Basic Task Creation:**
```
Input: "Call John tomorrow at 3pm"
Result: 
- Task: "Call John"
- Scheduled: Tomorrow at 3:00 PM
- Reminder: Tomorrow at 2:30 PM
- Category: Communication
- Priority: Medium
```

### **Complex Scheduling:**
```
Input: "Prepare quarterly presentation for Friday meeting at 10am"
Result:
- Task: "Prepare quarterly presentation"
- Scheduled: Friday at 10:00 AM
- Reminder: Friday at 9:30 AM
- Category: Meeting
- Priority: High
- Estimated Time: 120 minutes
```

### **Deadline Tasks:**
```
Input: "Submit project report by January 20th"
Result:
- Task: "Submit project report"
- Due Date: January 20th
- Reminder: January 19th at 5:30 PM
- Category: Work task
- Priority: High
```

## Supported Date/Time Formats

### **Dates:**
- **Full month names:** January, February, March, etc.
- **Abbreviated months:** Jan, Feb, Mar, etc.
- **Date formats:** 15/01/2024, 15-01-2024
- **Relative dates:** today, tomorrow, next week, next month

### **Times:**
- **12-hour format:** 3pm, 3:30pm, 3:30 PM
- **24-hour format:** 15:30, 15:30
- **Time periods:** morning, afternoon, evening, night

### **Combined:**
- "Meeting tomorrow at 2pm"
- "Call client on Friday 3:30pm"
- "Submit report by January 15th at 5pm"

## AI Analysis Features

### **Automatic Categorization:**
- **Work tasks:** Reviews, reports, documentation
- **Meetings:** Calls, presentations, team syncs
- **Personal:** Appointments, errands, health
- **Learning:** Training, courses, reading

### **Priority Detection:**
- **High:** urgent, critical, asap, deadline
- **Medium:** regular tasks, meetings
- **Low:** optional, nice-to-have

### **Time Estimation:**
- **Quick tasks:** 5-15 minutes
- **Standard tasks:** 30-60 minutes
- **Complex tasks:** 2-4 hours
- **Projects:** 1-2 days

## Notification System

### **Automatic Reminders:**
- **30 minutes** before scheduled time
- **Browser notifications** (if enabled)
- **In-app notifications**
- **Email reminders** (if configured)

### **Smart Notifications:**
- **Due date reminders** for deadline tasks
- **Progress updates** for long tasks
- **Completion confirmations**

## Testing the AI

### **Test Button:**
Click the "Test AI" button to try different examples:
- "Call John tomorrow at 3pm"
- "Review documents by Friday 2:30pm"
- "Team meeting next Tuesday morning"
- "Submit report by January 20th"
- "Client presentation at 10am today"

### **Quick Examples:**
Use the expandable quick examples to test various formats:
- "Review project proposal by tomorrow 3pm"
- "Call client at 2pm today"
- "Prepare presentation for Friday meeting at 10am"
- "Team meeting tomorrow morning at 9am"
- "Submit report by January 15th"

## Benefits

1. **Natural Language:** Write tasks as you think them
2. **Automatic Scheduling:** No manual date/time entry needed
3. **Smart Reminders:** Never miss important tasks
4. **Time Management:** Optimized scheduling based on your patterns
5. **Productivity:** Focus on work, not task management

## Tips for Best Results

1. **Be specific:** "Call John tomorrow at 3pm" vs "Call John"
2. **Include context:** "Review quarterly reports by Friday 3pm"
3. **Use natural language:** "Team meeting next Tuesday morning"
4. **Mention priorities:** "Urgent: Submit report by tomorrow"
5. **Include deadlines:** "Project due by January 20th"

The AI gets smarter with more usage and learns your scheduling preferences over time! 