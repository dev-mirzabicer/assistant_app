// tasks/tasks_data.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const config = require("../config"); // Import configuration

const MONGODB_URI = config.mongodb.uri;
const DATABASE_NAME = config.mongodb.dbName;
const TASKS_COLLECTION_NAME = "tasks"; // Collection for tasks
const TODOS_COLLECTION_NAME = "todos"; // Collection for to-dos
const STUDIES_COLLECTION_NAME = "studies"; // Collection for studies

let client; // MongoDB client instance

/**
 * Connects to the MongoDB database if not already connected.
 * @returns {Promise<MongoClient>} MongoDB client object.
 */
async function connectToDatabase() {
  try {
    if (!client || !client.topology || !client.topology.isConnected()) {
      client = new MongoClient(MONGODB_URI);
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
 * Validates task data before storage.
 * @param {Object} taskData Task data to validate.
 * @throws {Error} If validation fails.
 */
function validateTaskData(taskData) {
  if (!taskData.title || typeof taskData.title !== "string") {
    throw new Error("Task title is required and must be a string.");
  }
  if (!taskData.duration || typeof taskData.duration !== "number") {
    throw new Error("Task duration is required and must be a number.");
  }
  if (!taskData.date || isNaN(new Date(taskData.date))) {
    throw new Error("Task date is required and must be a valid date.");
  }
}

/**
 * Validates to-do data before storage.
 * @param {Object} toDoData To-do data to validate.
 * @throws {Error} If validation fails.
 */
function validateToDoData(toDoData) {
  if (!toDoData.title || typeof toDoData.title !== "string") {
    throw new Error("To-do title is required and must be a string.");
  }
  if (!toDoData.date || isNaN(new Date(toDoData.date))) {
    throw new Error("To-do date is required and must be a valid date.");
  }
}

/**
 * Validates study session data before storage.
 * @param {Object} studyData Study session data to validate.
 * @throws {Error} If validation fails.
 */
function validateStudyData(studyData) {
  if (!studyData.title || typeof studyData.title !== "string") {
    throw new Error("Study session title is required and must be a string.");
  }
  if (!studyData.duration || typeof studyData.duration !== "number") {
    throw new Error("Study session duration is required and must be a number.");
  }
}

/**
 * Stores a task in the database.
 * @param {Object} taskData Task details.
 * @returns {Promise<ObjectId>} ID of the inserted task.
 */
async function storeTask(taskData) {
  try {
    validateTaskData(taskData); // Validate data before storage

    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(TASKS_COLLECTION_NAME);
    const result = await collection.insertOne(taskData);
    return result.insertedId;
  } catch (error) {
    console.error("Error storing task:", error.message);
    throw error;
  }
}

/**
 * Retrieves a task by its unique identifier.
 * @param {ObjectId | string} taskId Unique identifier of the task.
 * @returns {Promise<Object>} Task data object.
 */
async function retrieveTaskById(taskId) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(TASKS_COLLECTION_NAME);

    // Validate ObjectId
    if (typeof taskId === "string" && !ObjectId.isValid(taskId)) {
      throw new Error("Invalid taskId provided.");
    }

    const task = await collection.findOne({
      _id: typeof taskId === "string" ? ObjectId(taskId) : taskId,
    });
    return task;
  } catch (error) {
    console.error("Error retrieving task:", error.message);
    throw error;
  }
}

/**
 * Retrieves tasks based on specified criteria.
 * @param {Object} query Filters like date, status (scheduled/unscheduled).
 * @returns {Promise<Array<Object>>} Array of task objects.
 */
async function retrieveTasks(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(TASKS_COLLECTION_NAME);
    const tasks = await collection.find(query).toArray();
    return tasks;
  } catch (error) {
    console.error("Error retrieving tasks:", error.message);
    throw error;
  }
}

/**
 * Updates task data in the database.
 * @param {ObjectId | string} taskId Unique identifier.
 * @param {Object} updatedData Fields to update.
 * @returns {Promise<Object>} Database operation result.
 */
async function updateTaskData(taskId, updatedData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(TASKS_COLLECTION_NAME);

    // Validate ObjectId
    if (typeof taskId === "string" && !ObjectId.isValid(taskId)) {
      throw new Error("Invalid taskId provided.");
    }

    const result = await collection.updateOne(
      { _id: typeof taskId === "string" ? ObjectId(taskId) : taskId },
      { $set: updatedData }
    );
    return result;
  } catch (error) {
    console.error("Error updating task data:", error.message);
    throw error;
  }
}

/**
 * Deletes a task from the database.
 * @param {ObjectId | string} taskId Unique identifier.
 * @returns {Promise<Object>} Deletion result.
 */
async function deleteTaskData(taskId) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(TASKS_COLLECTION_NAME);

    // Validate ObjectId
    if (typeof taskId === "string" && !ObjectId.isValid(taskId)) {
      throw new Error("Invalid taskId provided.");
    }

    const result = await collection.deleteOne({
      _id: typeof taskId === "string" ? ObjectId(taskId) : taskId,
    });
    return result;
  } catch (error) {
    console.error("Error deleting task data:", error.message);
    throw error;
  }
}

/**
 * Stores a to-do item in the database.
 * @param {Object} toDoData To-do details.
 * @returns {Promise<ObjectId>} ID of the inserted to-do item.
 */
async function storeToDoData(toDoData) {
  try {
    validateToDoData(toDoData); // Validate data before storage

    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(TODOS_COLLECTION_NAME);
    const result = await collection.insertOne(toDoData);
    return result.insertedId;
  } catch (error) {
    console.error("Error storing to-do data:", error.message);
    throw error;
  }
}

/**
 * Retrieves to-dos based on specified criteria.
 * @param {Object} query Filters like date, status (scheduled/unscheduled).
 * @returns {Promise<Array<Object>>} Array of to-do objects.
 */
async function retrieveToDos(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(TODOS_COLLECTION_NAME);
    const toDos = await collection.find(query).toArray();
    return toDos;
  } catch (error) {
    console.error("Error retrieving to-dos:", error.message);
    throw error;
  }
}

/**
 * Stores a study session in the database.
 * @param {Object} studyData Study session details.
 * @returns {Promise<ObjectId>} ID of the inserted study session.
 */
async function storeStudySessionData(studyData) {
  try {
    validateStudyData(studyData); // Validate data before storage

    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(STUDIES_COLLECTION_NAME);
    const result = await collection.insertOne(studyData);
    return result.insertedId;
  } catch (error) {
    console.error("Error storing study session data:", error.message);
    throw error;
  }
}

/**
 * Retrieves studies based on specified criteria.
 * @param {Object} query Filters like date, status (scheduled/unscheduled).
 * @returns {Promise<Array<Object>>} Array of study objects.
 */
async function retrieveStudies(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(STUDIES_COLLECTION_NAME);
    const studies = await collection.find(query).toArray();
    return studies;
  } catch (error) {
    console.error("Error retrieving studies:", error.message);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  closeConnection,
  storeTask,
  retrieveTaskById,
  retrieveTasks,
  updateTaskData,
  deleteTaskData,
  storeToDoData,
  retrieveToDos,
  storeStudySessionData,
  retrieveStudies,
};
