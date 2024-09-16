// finance/finance_manager.js

const financeData = require("./finance_data");

/**
 * Logs an expense.
 * @param {Object} expenseData Expense details (amount, category, date, description).
 * @returns {Promise<string>} Confirmation message.
 */
async function logExpense(expenseData) {
  try {
    await financeData.storeExpense(expenseData);
    return "Expense logged successfully.";
  } catch (error) {
    console.error("Error logging expense:", error.message);
    throw error; // Re-throw for handling in the calling function
  }
}

/**
 * Calculates the current balance.
 * @returns {Promise<number>} Current balance amount.
 */
async function getCurrentBalance() {
  try {
    const expenses = await financeData.retrieveExpenses({}); // Fetch all expenses
    const income = await financeData.retrieveIncome({}); // Fetch all income
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const totalIncome = income.reduce((sum, income) => sum + income.amount, 0);
    return totalIncome - totalExpenses;
  } catch (error) {
    console.error("Error calculating balance:", error.message);
    throw error;
  }
}

/**
 * Logs incoming funds (income).
 * @param {Object} incomeData Income details (amount, source, date, description).
 * @returns {Promise<string>} Confirmation message.
 */
async function addIncome(incomeData) {
  try {
    await financeData.storeIncome(incomeData);
    return "Income added successfully.";
  } catch (error) {
    console.error("Error adding income:", error.message);
    throw error;
  }
}

/**
 * Generates an expense report for a specified time frame.
 * @param {Object} timeFrame Time frame (start date and end date).
 * @returns {Promise<Array<Object>>} Expense report data.
 */
async function getExpenseReport(timeFrame) {
  try {
    const expenses = await financeData.retrieveExpenses({
      date: { $gte: timeFrame.startDate, $lte: timeFrame.endDate },
    });
    return expenses;
  } catch (error) {
    console.error("Error generating expense report:", error.message);
    throw error;
  }
}

/**
 * Provides a breakdown of spending by category for a specified time frame.
 * @param {Object} timeFrame Time frame (start date and end date).
 * @returns {Promise<Object>} Spending data categorized.
 */
async function getSpendingByCategory(timeFrame) {
  try {
    const expenses = await financeData.retrieveExpenses({
      date: { $gte: timeFrame.startDate, $lte: timeFrame.endDate },
    });
    const spendingByCategory = {};
    expenses.forEach((expense) => {
      if (spendingByCategory[expense.category]) {
        spendingByCategory[expense.category] += expense.amount;
      } else {
        spendingByCategory[expense.category] = expense.amount;
      }
    });
    return spendingByCategory;
  } catch (error) {
    console.error("Error getting spending by category:", error.message);
    throw error;
  }
}

module.exports = {
  logExpense,
  getCurrentBalance,
  addIncome,
  getExpenseReport,
  getSpendingByCategory,
};
