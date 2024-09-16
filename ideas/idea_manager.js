// ideas/idea_manager.js

const ideaData = require("./idea_data");

/**
 * Logs a new idea with details.
 * @param {Object} ideaData Includes title, description, categories, timestamp.
 * @returns {Promise<string>} Confirmation of idea logging.
 */
async function logIdea(ideaData) {
  try {
    await ideaData.storeIdea(ideaData);
    return "Idea logged successfully.";
  } catch (error) {
    console.error("Error logging idea:", error.message);
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
    const ideas = await ideaData.retrieveIdeas(query);
    return ideas;
  } catch (error) {
    console.error("Error retrieving ideas:", error.message);
    throw error;
  }
}

/**
 * Updates an existing idea.
 * @param {string} ideaId Unique identifier of the idea.
 * @param {Object} updatedData Fields to update.
 * @returns {Promise<Object>} Database operation result.
 */
async function updateIdea(ideaId, updatedData) {
  try {
    const result = await ideaData.updateIdea(ideaId, updatedData);
    return result;
  } catch (error) {
    console.error("Error updating idea:", error.message);
    throw error;
  }
}

/**
 * Deletes an idea.
 * @param {string} ideaId Unique identifier of the idea.
 * @returns {Promise<Object>} Database operation result.
 */
async function deleteIdea(ideaId) {
  try {
    const result = await ideaData.deleteIdea(ideaId);
    return result;
  } catch (error) {
    console.error("Error deleting idea:", error.message);
    throw error;
  }
}

module.exports = {
  logIdea,
  retrieveIdeas,
  updateIdea,
  deleteIdea,
};
