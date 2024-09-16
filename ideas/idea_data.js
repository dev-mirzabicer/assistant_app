// ideas/idea_data.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const config = require("../config"); // Import configuration

const MONGODB_URI = config.mongodb.uri;
const DATABASE_NAME = config.mongodb.dbName;
const COLLECTION_NAME = "ideas"; // Collection for ideas

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
 * Stores idea data in the database.
 * @param {Object} ideaData Details of the idea.
 * @returns {Promise<ObjectId>} ID of the inserted idea.
 */
async function storeIdea(ideaData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.insertOne(ideaData);
    return result.insertedId;
  } catch (error) {
    console.error("Error storing idea:", error.message);
    throw error;
  }
}

/**
 * Retrieves ideas based on filters.
 * @param {Object} query Filters like date range, categories.
 * @returns {Promise<Array<Object>>} Array of idea records.
 */
async function retrieveIdeas(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const ideas = await collection.find(query).toArray();
    return ideas;
  } catch (error) {
    console.error("Error retrieving ideas:", error.message);
    throw error;
  }
}

/**
 * Updates an existing idea.
 * @param {ObjectId | string} ideaId Unique identifier of the idea.
 * @param {Object} updatedData Fields to update.
 * @returns {Promise<Object>} Database operation result.
 */
async function updateIdea(ideaId, updatedData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Validate ObjectId
    if (typeof ideaId === "string" && !ObjectId.isValid(ideaId)) {
      throw new Error("Invalid ideaId provided.");
    }

    const result = await collection.updateOne(
      { _id: typeof ideaId === "string" ? ObjectId(ideaId) : ideaId },
      { $set: updatedData }
    );
    return result;
  } catch (error) {
    console.error("Error updating idea:", error.message);
    throw error;
  }
}

/**
 * Deletes an idea.
 * @param {ObjectId | string} ideaId Unique identifier of the idea.
 * @returns {Promise<Object>} Database operation result.
 */
async function deleteIdea(ideaId) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Validate ObjectId
    if (typeof ideaId === "string" && !ObjectId.isValid(ideaId)) {
      throw new Error("Invalid ideaId provided.");
    }

    const result = await collection.deleteOne({
      _id: typeof ideaId === "string" ? ObjectId(ideaId) : ideaId,
    });
    return result;
  } catch (error) {
    console.error("Error deleting idea:", error.message);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  closeConnection,
  storeIdea,
  retrieveIdeas,
  updateIdea,
  deleteIdea,
};
