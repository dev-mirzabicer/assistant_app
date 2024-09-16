// tasks/tasks_manager.js

const tasksData = require("./tasks_data");

/**
 * Validates task data before creation.
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
 * Validates to-do data before creation.
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
 * Validates study session data before creation.
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
 * Creates a new task.
 * @param {Object} taskData Includes title, description, duration, and date.
 * @returns {Promise<string>} Confirmation of task creation with a unique task ID.
 */
async function createTask(taskData) {
  try {
    validateTaskData(taskData);
    const taskId = await tasksData.storeTask(taskData);
    return `Task created successfully with ID: ${taskId}`;
  } catch (error) {
    console.error(
      `Error creating task with data ${JSON.stringify(taskData)}: ${
        error.message
      }`
    );
    throw error;
  }
}

/**
 * Creates a new to-do item.
 * @param {Object} toDoData Includes title, description, and date.
 * @returns {Promise<string>} Confirmation of to-do creation with a unique to-do ID.
 */
async function createToDo(toDoData) {
  try {
    validateToDoData(toDoData);
    const toDoId = await tasksData.storeToDoData(toDoData);
    return `To-do created successfully with ID: ${toDoId}`;
  } catch (error) {
    console.error(
      `Error creating to-do with data ${JSON.stringify(toDoData)}: ${
        error.message
      }`
    );
    throw error;
  }
}

/**
 * Creates a new study session.
 * @param {Object} studyData Includes title, description, and duration.
 * @returns {Promise<string>} Confirmation of study session creation with a unique study ID.
 */
async function createStudySession(studyData) {
  try {
    validateStudyData(studyData);
    const studyId = await tasksData.storeStudySessionData(studyData);
    return `Study session created successfully with ID: ${studyId}`;
  } catch (error) {
    console.error(
      `Error creating study session with data ${JSON.stringify(studyData)}: ${
        error.message
      }`
    );
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
    const tasks = await tasksData.retrieveTasks(query);
    return tasks;
  } catch (error) {
    console.error(
      `Error retrieving tasks with query ${JSON.stringify(query)}: ${
        error.message
      }`
    );
    throw error;
  }
}

/**
 * Updates an existing task.
 * @param {string} taskId Unique identifier of the task.
 * @param {Object} updatedData Fields to update.
 * @returns {Promise<string>} Update confirmation.
 */
async function updateTask(taskId, updatedData) {
  try {
    await tasksData.updateTaskData(taskId, updatedData);
    return "Task updated successfully.";
  } catch (error) {
    console.error(`Error updating task with ID ${taskId}: ${error.message}`);
    throw error;
  }
}

/**
 * Deletes a task.
 * @param {string} taskId Unique identifier of the task.
 * @returns {Promise<string>} Deletion confirmation.
 */
async function deleteTask(taskId) {
  try {
    await tasksData.deleteTaskData(taskId);
    return "Task deleted successfully.";
  } catch (error) {
    console.error(`Error deleting task with ID ${taskId}: ${error.message}`);
    throw error;
  }
}

/**
 * Marks a task as completed.
 * @param {string} taskId Unique identifier of the task.
 * @returns {Promise<string>} Confirmation of completion.
 */
async function markTaskAsCompleted(taskId) {
  try {
    await tasksData.updateTaskData(taskId, { status: "completed" });
    return "Task marked as completed.";
  } catch (error) {
    console.error(
      `Error marking task with ID ${taskId} as completed: ${error.message}`
    );
    throw error;
  }
}

module.exports = {
  createTask,
  createToDo,
  createStudySession,
  retrieveTasks,
  updateTask,
  deleteTask,
  markTaskAsCompleted,
};
