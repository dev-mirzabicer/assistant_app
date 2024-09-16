// news/news_summarizer.js

const { Configuration, OpenAIApi } = require("openai");
const config = require("../config");

const configuration = new Configuration({
  apiKey: config.openai.apiKey,
});
const openai = new OpenAIApi(configuration);

/**
 * Generates a concise summary of the article and structures it with metadata.
 * @param {string} articleContent Full text of the news article.
 * @param {Object} metadata Metadata of the article (title, source, etc.).
 * @returns {Promise<Object>} Structured summary object.
 */
async function summarizeArticle(articleContent, metadata) {
  try {
    const prompt = `Please summarize the following news article and provide the summary in JSON format with the following structure:
    \`\`\`json
    {
      "summary": "...",
      "tags": ["..."],
      "source": "...",
      "publicationDate": "..."
    }
    \`\`\`
    
    Here's the article:
    
    ${articleContent}
    
    Here's the metadata:
    
    ${JSON.stringify(metadata)}
    `;

    const response = await openai.createCompletion({
      model: "text-davinci-003", // You can choose a different model if needed
      prompt,
      max_tokens: 256, // Adjust as needed for the desired summary length
      temperature: 0.5, // Adjust for creativity (0.0 - 1.0)
    });

    const summaryJson = response.data.choices[0].text.trim();

    // Parse the JSON response, handling potential errors
    try {
      const structuredSummary = JSON.parse(summaryJson);
      return structuredSummary;
    } catch (error) {
      console.error("Error parsing LLM response:", error.message);
      // You might want to handle this error by returning a default summary or retrying
      return {
        summary: "Error generating summary.",
        tags: [],
        source: metadata.source.name,
        publicationDate: metadata.publishedAt,
      };
    }
  } catch (error) {
    console.error("Error summarizing article:", error.message);
    throw error;
  }
}

module.exports = {
  summarizeArticle,
};
