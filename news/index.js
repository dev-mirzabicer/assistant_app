// news/index.js

const newsFetcher = require("./news_fetcher");
const newsSummarizer = require("./news_summarizer");

/**
 * Fetches, summarizes, and structures news articles for specified categories.
 * @param {Array<string>} categories List of news categories (e.g., "business", "technology").
 * @returns {Promise<Array<Object>>} Array of structured news summaries.
 */
async function getSummarizedNews(categories) {
  try {
    const articles = await newsFetcher.fetchNewsArticles(categories);

    const summaries = await Promise.all(
      articles.map(async (article) => {
        const content = await newsFetcher.fetchArticleContent(article.url);
        const summary = await newsSummarizer.summarizeArticle(content, article);
        return summary;
      })
    );

    return summaries;
  } catch (error) {
    console.error("Error getting summarized news:", error.message);
    throw error;
  }
}

module.exports = {
  getSummarizedNews,
};
