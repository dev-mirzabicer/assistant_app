// time/index.js

const googleCalendar = require("./google_calendar");
const mongoCalendar = require("./mongo_calendar");
const config = require("../config");

/**
 * Synchronizes events between Google Calendar and MongoDB.
 * @returns {Promise<void>}
 */
async function syncEvents() {
  try {
    // Authenticate with Google Calendar API
    const auth = await googleCalendar.authenticate();

    // Fetch events from Google Calendar
    const googleEvents = await googleCalendar.fetchEvents(
      auth,
      config.google.calendarId,
      new Date(), // Start time: today
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // End time: 7 days from now
    );

    // Fetch events from MongoDB
    const mongoEvents = await mongoCalendar.fetchEvents({});

    // Map events by Google Event ID for quick lookup
    const mongoEventsMap = new Map();
    mongoEvents.forEach((event) => {
      if (event.googleEventId) {
        mongoEventsMap.set(event.googleEventId, event);
      }
    });

    // Sync from Google Calendar to MongoDB
    for (const googleEvent of googleEvents) {
      const mongoEvent = mongoEventsMap.get(googleEvent.id);
      if (!mongoEvent) {
        // Event exists in Google Calendar but not in MongoDB - add to MongoDB
        console.log(`Adding event "${googleEvent.summary}" to MongoDB.`);
        await mongoCalendar.insertEvent({
          ...googleEvent,
          googleEventId: googleEvent.id,
        });
      } else {
        // Event exists in both, check for differences
        if (hasEventChanged(googleEvent, mongoEvent)) {
          console.log(`Updating event "${googleEvent.summary}" in MongoDB.`);
          await mongoCalendar.updateEvent(mongoEvent._id, {
            ...googleEvent,
            googleEventId: googleEvent.id,
          });
        }
      }
    }

    // Sync from MongoDB to Google Calendar
    for (const mongoEvent of mongoEvents) {
      if (!mongoEvent.googleEventId) continue; // Skip if no linked Google Event ID
      const googleEvent = googleEvents.find(
        (event) => event.id === mongoEvent.googleEventId
      );
      if (!googleEvent) {
        // Event exists in MongoDB but not in Google Calendar - add to Google Calendar
        console.log(`Adding event "${mongoEvent.summary}" to Google Calendar.`);
        const newGoogleEvent = await googleCalendar.createEvent(
          auth,
          config.google.calendarId,
          mongoEvent
        );
        // Update MongoDB with new Google Event ID
        await mongoCalendar.updateEvent(mongoEvent._id, {
          ...mongoEvent,
          googleEventId: newGoogleEvent.id,
        });
      }
    }
  } catch (error) {
    console.error("Error during synchronization:", error.message);
  } finally {
    // Close MongoDB connection
    await mongoCalendar.closeConnection();
  }
}

/**
 * Checks if the event data has changed between Google Calendar and MongoDB.
 * @param {Object} googleEvent Google Calendar event object.
 * @param {Object} mongoEvent MongoDB event object.
 * @returns {boolean} True if events differ, false otherwise.
 */
function hasEventChanged(googleEvent, mongoEvent) {
  // Implement a thorough comparison of relevant fields
  return (
    googleEvent.summary !== mongoEvent.summary ||
    googleEvent.start.dateTime !== mongoEvent.start.dateTime ||
    googleEvent.end.dateTime !== mongoEvent.end.dateTime ||
    googleEvent.description !== mongoEvent.description
  );
}

/**
 * Inserts a new event into both Google Calendar and MongoDB.
 * @param {Object} eventData Event details (including metadata).
 * @returns {Promise<Object>} Created event object (with IDs from both sources).
 */
async function insertEvent(eventData) {
  try {
    // Authenticate with Google Calendar API
    const auth = await googleCalendar.authenticate();

    // Insert into Google Calendar
    const googleEvent = await googleCalendar.createEvent(
      auth,
      config.google.calendarId,
      eventData
    );

    // Insert into MongoDB, linking with Google Calendar event ID
    const mongoEventId = await mongoCalendar.insertEvent({
      ...eventData,
      googleEventId: googleEvent.id,
    });

    // Return combined event object
    return {
      googleEventId: googleEvent.id,
      mongoEventId,
    };
  } catch (error) {
    console.error("Error inserting event:", error.message);
    throw error;
  }
}

/**
 * Updates an existing event in both Google Calendar and MongoDB.
 * @param {string} googleEventId Google Calendar event ID.
 * @param {string} mongoEventId MongoDB event ID.
 * @param {Object} eventData Updated event details.
 * @returns {Promise<Object>} Updated event object.
 */
async function updateEvent(googleEventId, mongoEventId, eventData) {
  try {
    // Authenticate with Google Calendar API
    const auth = await googleCalendar.authenticate();

    // Update in Google Calendar
    const googleEvent = await googleCalendar.updateEvent(
      auth,
      config.google.calendarId,
      googleEventId,
      eventData
    );

    // Update in MongoDB
    const mongoUpdateResult = await mongoCalendar.updateEvent(
      mongoEventId,
      eventData
    );

    // Return updated event object (you might want to combine data from both sources)
    return {
      googleEvent,
      mongoUpdateResult,
    };
  } catch (error) {
    console.error("Error updating event:", error.message);
    throw error;
  }
}

/**
 * Deletes an event from both Google Calendar and MongoDB.
 * @param {string} googleEventId Google Calendar event ID.
 * @param {string} mongoEventId MongoDB event ID.
 * @returns {Promise<void>}
 */
async function deleteEvent(googleEventId, mongoEventId) {
  try {
    // Authenticate with Google Calendar API
    const auth = await googleCalendar.authenticate();

    // Delete from Google Calendar
    await googleCalendar.deleteEvent(
      auth,
      config.google.calendarId,
      googleEventId
    );

    // Delete from MongoDB
    await mongoCalendar.deleteEvent(mongoEventId);
  } catch (error) {
    console.error("Error deleting event:", error.message);
    throw error;
  }
}

/**
 * Calculates free time intervals based on events and routines.
 * @param {Array<Object>} events Array of events.
 * @returns {Array<Object>} Array of free time intervals.
 */
function calculateFreeTimeIntervals(events) {
  // 1. Sort events by start time
  events.sort(
    (a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime)
  );

  // 2. Initialize free time intervals
  const freeTimeIntervals = [];
  let currentFreeTimeStart = new Date(); // Start of the day

  // 3. Iterate through events and find free time intervals
  for (const event of events) {
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);

    if (eventStart > currentFreeTimeStart) {
      freeTimeIntervals.push({
        start: currentFreeTimeStart,
        end: eventStart,
      });
    }

    currentFreeTimeStart = eventEnd;
  }

  // 4. Add the remaining free time at the end of the day
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999); // Set to the end of the current day
  if (endOfDay > currentFreeTimeStart) {
    freeTimeIntervals.push({
      start: currentFreeTimeStart,
      end: endOfDay,
    });
  }

  return freeTimeIntervals;
}

module.exports = {
  syncEvents,
  insertEvent,
  updateEvent,
  deleteEvent,
  calculateFreeTimeIntervals,
};
