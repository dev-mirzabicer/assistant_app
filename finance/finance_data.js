// finance/finance_data.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const config = require("../config"); // Import configuration

const MONGODB_URI = config.mongodb.uri;
const DATABASE_NAME = config.mongodb.dbName;
const EXPENSES_COLLECTION_NAME = "expenses"; // Collection for expenses
const INCOME_COLLECTION_NAME = "income"; // Collection for income

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
 * Stores expense data in the database.
 * @param {Object} expenseData Details of the expense.
 * @returns {Promise<ObjectId>} ID of the inserted expense.
 */
async function storeExpense(expenseData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(EXPENSES_COLLECTION_NAME);
    const result = await collection.insertOne(expenseData);
    return result.insertedId;
  } catch (error) {
    console.error("Error storing expense:", error.message);
    throw error;
  }
}

/**
 * Stores income data in the database.
 * @param {Object} incomeData Details of the income.
 * @returns {Promise<ObjectId>} ID of the inserted income.
 */
async function storeIncome(incomeData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(INCOME_COLLECTION_NAME);
    const result = await collection.insertOne(incomeData);
    return result.insertedId;
  } catch (error) {
    console.error("Error storing income:", error.message);
    throw error;
  }
}

/**
 * Retrieves expenses based on filters.
 * @param {Object} query Filters like date range, category.
 * @returns {Promise<Array<Object>>} Array of expense records.
 */
async function retrieveExpenses(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(EXPENSES_COLLECTION_NAME);
    const expenses = await collection.find(query).toArray();
    return expenses;
  } catch (error) {
    console.error("Error retrieving expenses:", error.message);
    throw error;
  }
}

/**
 * Retrieves income based on filters.
 * @param {Object} query Filters like date range, source.
 * @returns {Promise<Array<Object>>} Array of income records.
 */
async function retrieveIncome(query) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(INCOME_COLLECTION_NAME);
    const income = await collection.find(query).toArray();
    return income;
  } catch (error) {
    console.error("Error retrieving income:", error.message);
    throw error;
  }
}

/**
 * Updates an existing expense entry.
 * @param {ObjectId | string} expenseId Unique identifier of the expense.
 * @param {Object} updatedData Fields to update.
 * @returns {Promise<Object>} Database operation result.
 */
async function updateExpense(expenseId, updatedData) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(EXPENSES_COLLECTION_NAME);

    // Validate ObjectId
    if (typeof expenseId === "string" && !ObjectId.isValid(expenseId)) {
      throw new Error("Invalid expenseId provided.");
    }

    const result = await collection.updateOne(
      { _id: typeof expenseId === "string" ? ObjectId(expenseId) : expenseId },
      { $set: updatedData }
    );
    return result;
  } catch (error) {
    console.error("Error updating expense:", error.message);
    throw error;
  }
}

/**
 * Deletes an expense entry.
 * @param {ObjectId | string} expenseId Unique identifier of the expense.
 * @returns {Promise<Object>} Database operation result.
 */
async function deleteExpense(expenseId) {
  try {
    const client = await connectToDatabase();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(EXPENSES_COLLECTION_NAME);

    // Validate ObjectId
    if (typeof expenseId === "string" && !ObjectId.isValid(expenseId)) {
      throw new Error("Invalid expenseId provided.");
    }

    const result = await collection.deleteOne({
      _id: typeof expenseId === "string" ? ObjectId(expenseId) : expenseId,
    });
    return result;
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  closeConnection,
  storeExpense,
  storeIncome,
  retrieveExpenses,
  retrieveIncome,
  updateExpense,
  deleteExpense,
};
