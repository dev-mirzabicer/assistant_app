// progress/language_tracker.js

const progressData = require("./progress_data");

/**
 * Logs the number of words learned in a language on the current day.
 * @param {string} language Language being learned (e.g., Swedish).
 * @param {number} wordCount Number of words learned.
 * @returns {Promise<string>} Confirmation of logging.
 */
async function logWordsLearned(language, wordCount) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const progressData = {
      language,
      date: today,
      wordCount,
    };

    await progressData.storeProgressData(progressData);
    return "Words learned logged successfully.";
  } catch (error) {
    console.error("Error logging words learned:", error.message);
    throw error;
  }
}

/**
 * Retrieves progress towards monthly word count goals.
 * @param {string} language Language of interest.
 * @returns {Promise<Object>} Progress data.
 */
async function getMonthlyProgress(language) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const progressData = await progressData.retrieveProgressData({
      language,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Calculate total words learned this month
    const totalWordsLearned = progressData.reduce(
      (sum, data) => sum + data.wordCount,
      0
    );

    // Fetch monthly goal from the database
    const monthlyGoalData = await progressData.retrieveProgressData({
      language,
      date: startOfMonth, // Assuming monthly goals are stored with the start date of the month
      type: "monthlyGoal", // Use a 'type' field to distinguish goals
    });

    const monthlyGoal =
      monthlyGoalData.length > 0 ? monthlyGoalData[0].wordCount : 0; // Default to 0 if no goal is set

    return {
      totalWordsLearned,
      monthlyGoal,
      progressPercentage: (totalWordsLearned / monthlyGoal) * 100,
    };
  } catch (error) {
    console.error("Error getting monthly progress:", error.message);
    throw error;
  }
}

/**
 * Sets or updates monthly learning goals.
 * @param {string} language Language of interest.
 * @param {number} wordCount Goal word count for the month.
 * @returns {Promise<string>} Confirmation of goal setting.
 */
async function setMonthlyGoals(language, wordCount) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const existingGoal = await progressData.retrieveProgressData({
      language,
      date: startOfMonth,
      type: "monthlyGoal",
    });

    if (existingGoal.length > 0) {
      // Update existing goal
      await progressData.updateProgressData(existingGoal[0]._id, {
        wordCount,
      });
      return "Monthly goal updated successfully.";
    } else {
      // Create new goal
      await progressData.storeProgressData({
        language,
        date: startOfMonth,
        wordCount,
        type: "monthlyGoal",
      });
      return "Monthly goal set successfully.";
    }
  } catch (error) {
    console.error("Error setting monthly goals:", error.message);
    throw error;
  }
}

module.exports = {
  logWordsLearned,
  getMonthlyProgress,
  setMonthlyGoals,
};
