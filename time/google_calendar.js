// time/google_calendar.js

const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");
require("dotenv").config();

const config = require("../config"); // Import configuration

const SCOPES = config.google.scopes;
const TOKEN_PATH = path.join(__dirname, config.google.tokenPath);

/**
 * Authenticates with Google Calendar API using OAuth2 client.
 * Handles token storage and refresh.
 * @returns {Promise<google.auth.OAuth2>} Authenticated client object.
 */
async function authenticate() {
  try {
    const credentials = JSON.parse(
      await fs.readFile(process.env.CREDENTIALS_PATH)
    );
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    try {
      const token = JSON.parse(await fs.readFile(TOKEN_PATH));
      oAuth2Client.setCredentials(token);
    } catch (err) {
      await getAccessToken(oAuth2Client);
    }

    // Set token refresh event
    oAuth2Client.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        // Store the refresh token in my database!
        saveToken(tokens);
      }
    });

    return oAuth2Client;
  } catch (error) {
    console.error("Error during authentication:", error.message);
    throw error;
  }
}

/**
 * Get and store new token after prompting for user authorization.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this URL:", authUrl);

  const code = await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      resolve(code);
    });
  });

  const tokenResponse = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokenResponse.tokens);
  // Store the token to disk for later program executions
  await saveToken(tokenResponse.tokens);
}

/**
 * Saves the token to disk for later use.
 * @param {Object} token The token to store.
 */
async function saveToken(token) {
  try {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log("Token stored to", TOKEN_PATH);
  } catch (error) {
    console.error("Error saving token:", error.message);
    throw error;
  }
}

/**
 * Fetches events from the specified Google Calendar.
 * @param {google.auth.OAuth2} auth Authenticated client object.
 * @param {string} calendarId ID of the Google Calendar to fetch events from.
 * @param {Date} startTime Start time for the event range.
 * @param {Date} endTime End time for the event range.
 * @returns {Promise<Array<Object>>} Array of events.
 */
async function fetchEvents(auth, calendarId, startTime, endTime) {
  const calendar = google.calendar({ version: "v3", auth });
  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    return response.data.items;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error; // Re-throw the error for handling in the calling function
  }
}

/**
 * Creates a new event in the specified Google Calendar.
 * @param {google.auth.OAuth2} auth Authenticated client object.
 * @param {string} calendarId ID of the Google Calendar to create the event in.
 * @param {Object} eventData Event details (summary, start time, end time, description, etc.).
 * @returns {Promise<Object>} Created event object.
 */
async function createEvent(auth, calendarId, eventData) {
  const calendar = google.calendar({ version: "v3", auth });
  try {
    const response = await calendar.events.insert({
      calendarId,
      resource: eventData,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

/**
 * Updates an existing event in the specified Google Calendar.
 * @param {google.auth.OAuth2} auth Authenticated client object.
 * @param {string} calendarId ID of the Google Calendar containing the event.
 * @param {string} eventId ID of the event to update.
 * @param {Object} eventData Updated event details.
 * @returns {Promise<Object>} Updated event object.
 */
async function updateEvent(auth, calendarId, eventId, eventData) {
  const calendar = google.calendar({ version: "v3", auth });
  try {
    const response = await calendar.events.update({
      calendarId,
      eventId,
      resource: eventData,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

/**
 * Deletes an event from the specified Google Calendar.
 * @param {google.auth.OAuth2} auth Authenticated client object.
 * @param {string} calendarId ID of the Google Calendar containing the event.
 * @param {string} eventId ID of the event to delete.
 * @returns {Promise<void>}
 */
async function deleteEvent(auth, calendarId, eventId) {
  const calendar = google.calendar({ version: "v3", auth });
  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  authenticate,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
