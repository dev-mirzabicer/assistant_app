// news/news_fetcher.js

const NewsAPI = require("newsapi");
const axios = require("axios");
const config = require("../config");

const newsapi = new NewsAPI(config.newsapi.apiKey);

/**
 * Fetches latest news articles based on specified categories.
 * @param {Array<string>} categories List of news categories (e.g., "business", "technology").
 * @returns {Promise<Array<Object>>} Array of news article metadata.
 */
async function fetchNewsArticles(categories) {
  try {
    const promises = categories.map(async (category) => {
      const response = await newsapi.v2.topHeadlines({
        category,
        language: "en", // You can change the language as needed
        country: "us", // You can change the country as needed
      });
      return response.articles;
    });

    const articles = await Promise.all(promises);
    return articles.flat(); // Flatten the array of arrays
  } catch (error) {
    console.error("Error fetching news articles:", error.message);
    throw error;
  }
}

/**
 * Retrieves the full content of a news article.
 * @param {string} articleUrl URL of the news article.
 * @returns {Promise<string>} Article content as text.
 */
async function fetchArticleContent(articleUrl) {
  try {
    const response = await axios.get(articleUrl);
    return response.data; // Assuming the response contains the article content
  } catch (error) {
    console.error("Error fetching article content:", error.message);
    throw error;
  }
}

module.exports = {
  fetchNewsArticles,
  fetchArticleContent,
};
