// time/mongo_calendar.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const config = require("../config"); // Import configuration

const MONGODB_URI = config.mongodb.uri;
const DATABASE_NAME = config.mongodb.dbName;
const COLLECTION_NAME = config.mongodb.collectionName;

let client; // MongoDB client instance

/**
 * Connects to the MongoDB database if not already connected.
 * @returns {Promise<MongoClient>} MongoDB client object.
 */
async function connectToDatabase() {
  try {
    if (!client || !client.isConnected()) {
      client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
    }
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
}

/**
 * Closes the MongoDB client connection if open.
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (client && client.isConnected()) {
    try {
      await client.close();
      console.log("MongoDB connection closed.");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error.message);
    }
  }
}

/**
 * Inserts a new event into the MongoDB database.
 * @param {Object} eventData Event details (including metadata).
 * @returns {Promise<ObjectId>} ID of the inserted event.
 */
async function insertEvent(eventData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.insertOne(eventData);
    return result.insertedId;
  } catch (error) {
    console.error("Error inserting event into MongoDB:", error.message);
    throw error;
  }
}

/**
 * Fetches events from the MongoDB database.
 * @param {Object} query Query parameters for filtering events.
 * @returns {Promise<Array<Object>>} Array of events.
 */
async function fetchEvents(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const events = await collection.find(query).toArray();
    return events;
  } catch (error) {
    console.error("Error fetching events from MongoDB:", error.message);
    throw error;
  }
}

/**
 * Updates an existing event in the MongoDB database.
 * @param {ObjectId | string} eventId ID of the event to update.
 * @param {Object} eventData Updated event details.
 * @returns {Promise<Object>} Updated event object.
 */
async function updateEvent(eventId, eventData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Validate ObjectId
    if (typeof eventId === "string" && !ObjectId.isValid(eventId)) {
      throw new Error("Invalid eventId provided.");
    }

    const result = await collection.updateOne(
      { _id: typeof eventId === "string" ? ObjectId(eventId) : eventId },
      { $set: eventData }
    );
    return result;
  } catch (error) {
    console.error("Error updating event in MongoDB:", error.message);
    throw error;
  }
}

/**
 * Deletes an event from the MongoDB database.
 * @param {ObjectId | string} eventId ID of the event to delete.
 * @returns {Promise<void>}
 */
async function deleteEvent(eventId) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Validate ObjectId
    if (typeof eventId === "string" && !ObjectId.isValid(eventId)) {
      throw new Error("Invalid eventId provided.");
    }

    await collection.deleteOne({
      _id: typeof eventId === "string" ? ObjectId(eventId) : eventId,
    });
  } catch (error) {
    console.error("Error deleting event from MongoDB:", error.message);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  closeConnection,
  insertEvent,
  fetchEvents,
  updateEvent,
  deleteEvent,
};
