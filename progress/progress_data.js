// progress/progress_data.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const config = require("../config"); // Import configuration

const MONGODB_URI = config.mongodb.uri;
const DATABASE_NAME = config.mongodb.dbName;
const COLLECTION_NAME = "progress"; // Collection for progress data

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
 * Stores progress data into the database.
 * @param {Object} progressData Details of progress.
 * @returns {Promise<ObjectId>} ID of the inserted progress data.
 */
async function storeProgressData(progressData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.insertOne(progressData);
    return result.insertedId;
  } catch (error) {
    console.error("Error storing progress data:", error.message);
    throw error;
  }
}

/**
 * Retrieves progress data based on filters.
 * @param {Object} query Filters like language, date range.
 * @returns {Promise<Array<Object>>} Array of progress records.
 */
async function retrieveProgressData(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const progressData = await collection.find(query).toArray();
    return progressData;
  } catch (error) {
    console.error("Error retrieving progress data:", error.message);
    throw error;
  }
}

/**
 * Updates a progress data record.
 * @param {ObjectId | string} recordId Unique identifier.
 * @param {Object} updatedData Data to update.
 * @returns {Promise<Object>} Database operation result.
 */
async function updateProgressData(recordId, updatedData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Validate ObjectId
    if (typeof recordId === "string" && !ObjectId.isValid(recordId)) {
      throw new Error("Invalid recordId provided.");
    }

    const result = await collection.updateOne(
      { _id: typeof recordId === "string" ? ObjectId(recordId) : recordId },
      { $set: updatedData }
    );
    return result;
  } catch (error) {
    console.error("Error updating progress data:", error.message);
    throw error;
  }
}

/**
 * Deletes a progress data record.
 * @param {ObjectId | string} recordId Unique identifier.
 * @returns {Promise<Object>} Database operation result.
 */
async function deleteProgressData(recordId) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Validate ObjectId
    if (typeof recordId === "string" && !ObjectId.isValid(recordId)) {
      throw new Error("Invalid recordId provided.");
    }

    const result = await collection.deleteOne({
      _id: typeof recordId === "string" ? ObjectId(recordId) : recordId,
    });
    return result;
  } catch (error) {
    console.error("Error deleting progress data:", error.message);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  closeConnection,
  storeProgressData,
  retrieveProgressData,
  updateProgressData,
  deleteProgressData,
};
