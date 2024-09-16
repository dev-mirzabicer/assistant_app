// tasks/scheduling_interface.js

const tasksData = require("./tasks_data");
const timeModule = require("../time");
const moment = require("moment-timezone"); // For time zone handling

/**
 * Retrieves tasks, to-dos, and studies that have not yet been scheduled.
 * @returns {Promise<Array<Object>>} Array of unscheduled items.
 */
async function getUnscheduledTasks() {
  try {
    const tasks = await tasksData.retrieveTasks({ scheduled: false });
    const todos = await tasksData.retrieveToDos({ scheduled: false });
    const studies = await tasksData.retrieveStudies({ scheduled: false });

    return [...tasks, ...todos, ...studies];
  } catch (error) {
    console.error("Error retrieving unscheduled tasks:", error.message);
    throw error;
  }
}

/**
 * Schedules a task into a specific time slot and creates a calendar event.
 * @param {string} taskId Unique identifier of the task.
 * @param {Object} timeSlot Start and end times (in your preferred time zone).
 * @param {string} timeZone User's time zone (e.g., 'America/Los_Angeles').
 * @returns {Promise<string>} Confirmation of scheduling, including the calendar event ID.
 */
async function scheduleTask(taskId, timeSlot, timeZone) {
  try {
    const task = await tasksData.retrieveTaskById(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    // Convert time slot to UTC for Google Calendar
    const startDateTime = moment.tz(timeSlot.start, timeZone).utc().format();
    const endDateTime = moment.tz(timeSlot.end, timeZone).utc().format();

    // Create calendar event using the time module
    const eventData = {
      summary: task.title,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      description: `Task ID: ${taskId}`, // Include task ID in the description
    };
    const event = await timeModule.insertEvent(eventData);

    // Update task status in the database
    await tasksData.updateTaskData(taskId, {
      scheduled: true,
      calendarEventId: event.googleEventId,
    });

    return `Task scheduled successfully. Calendar Event ID: ${event.googleEventId}`;
  } catch (error) {
    console.error("Error scheduling task:", error.message);
    throw error;
  }
}

/**
 * Removes a task from the calendar and marks it as unscheduled.
 * @param {string} taskId Unique identifier of the task.
 * @returns {Promise<string>} Confirmation of unscheduling.
 */
async function unscheduleTask(taskId) {
  try {
    const task = await tasksData.retrieveTaskById(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    if (task.calendarEventId) {
      // Delete calendar event using the time module
      await timeModule.deleteEvent(task.calendarEventId, task._id);
    }

    // Update task status in the database
    await tasksData.updateTaskData(taskId, {
      scheduled: false,
      calendarEventId: null,
    });

    return "Task unscheduled successfully.";
  } catch (error) {
    console.error("Error unscheduling task:", error.message);
    throw error;
  }
}

/**
 * Suggests available time slots for scheduling a task based on duration and free time.
 * @param {string} taskId Unique identifier of the task.
 * @param {string} timeZone User's time zone (e.g., 'America/Los_Angeles').
 * @returns {Promise<Array<Object>>} Array of suggested time slots (in the user's time zone).
 */
async function suggestTimeSlots(taskId, timeZone) {
  try {
    const task = await tasksData.retrieveTaskById(taskId);

    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    // Fetch events from the time module for the next 7 days
    const today = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const events = await timeModule.fetchEvents(
      process.env.GOOGLE_CALENDAR_ID, // Assuming you're using the same calendar ID as in time module
      today,
      nextWeek
    );

    // Calculate free time intervals using the time module
    const freeTimeIntervals = timeModule.calculateFreeTimeIntervals(events);

    // Filter free time intervals based on task duration
    const suggestedTimeSlots = freeTimeIntervals.filter(
      (interval) =>
        interval.end.getTime() - interval.start.getTime() >=
        task.duration * 60 * 60 * 1000 // Convert duration from hours to milliseconds
    );

    // Convert time slots to user's time zone
    const timeSlotsInTimeZone = suggestedTimeSlots.map((interval) => ({
      start: moment.tz(interval.start, "UTC").tz(timeZone).format(),
      end: moment.tz(interval.end, "UTC").tz(timeZone).format(),
    }));

    return timeSlotsInTimeZone;
  } catch (error) {
    console.error("Error suggesting time slots:", error.message);
    throw error;
  }
}

module.exports = {
  getUnscheduledTasks,
  scheduleTask,
  unscheduleTask,
  suggestTimeSlots,
};
