// health/fitbit_api.js

const fitbit = require("fitbit-node");
const config = require("../config");

const CLIENT_ID = config.fitbit.clientId;
const CLIENT_SECRET = config.fitbit.clientSecret;
const REDIRECT_URI = config.fitbit.redirectUri;
const SCOPE = config.fitbit.scope;

let accessToken = null; // Store the access token

const client = new fitbit(CLIENT_ID, CLIENT_SECRET, {
  redirectUri: REDIRECT_URI,
  scope: SCOPE,
});

/**
 * Handles OAuth2 authentication with the Fitbit API using Implicit Grant Flow.
 * @returns {Promise<string>} Authorization URL.
 */
async function authenticateFitbit() {
  // Generate authorization URL with response_type=token for Implicit Grant Flow
  const authUrl = client.getAuthorizeUrl(SCOPE, REDIRECT_URI, "token");
  return authUrl;
}

/**
 * Extracts the access token from the redirect URL after authentication.
 * @param {string} redirectUrl Redirect URL received from Fitbit.
 * @returns {string|null} Access token or null if not found.
 */
function extractAccessToken(redirectUrl) {
  const match = redirectUrl.match(/#access_token=([^&]+)/);
  return match ? match[1] : null;
}

/**
 * Sets the access token for the Fitbit API.
 * @param {string} token Access token.
 */
function setAccessToken(token) {
  accessToken = token;
}

/**
 * Fetches daily health metrics for a given date.
 * @param {string} date Date in YYYY-MM-DD format.
 * @returns {Promise<Object>} Object containing HRV, RHR, breathing rate, cardio score, and SpO2.
 */
async function fetchDailyMetrics(date) {
  try {
    if (!accessToken) {
      throw new Error("Fitbit API not authenticated.");
    }

    const [
      activityResponse,
      breathingRateResponse,
      cardioScoreResponse,
      hrvResponse,
      spo2Response,
      tempSkinResponse,
    ] = await Promise.all([
      client.get("/activities/date/" + date + ".json", accessToken),
      client.get("/1/user/-/br/date/" + date + ".json", accessToken),
      client.get("/1/user/-/cardioscore/date/" + date + ".json", accessToken),
      client.get("/1/user/-/hrv/date/" + date + ".json", accessToken),
      client.get("/1/user/-/spo2/date/" + date + ".json", accessToken),
      client.get("/1/user/-/temp/skin/date/" + date + ".json", accessToken),
    ]);

    return {
      activity: activityResponse[0],
      breathingRate: breathingRateResponse[0].br[0].value.breathingRate,
      cardioScore: cardioScoreResponse[0].cardioScore[0].value.vo2Max,
      hrv: hrvResponse[0].hrv[0].value,
      spo2: spo2Response[0].value,
      tempSkin: tempSkinResponse[0].tempSkin[0].value,
    };
  } catch (error) {
    console.error("Error fetching daily metrics:", error.message);
    throw error;
  }
}

/**
 * Retrieves detailed sleep data for a specified date.
 * @param {string} date Date in YYYY-MM-DD format.
 * @returns {Promise<Object>} Sleep data including stages and duration.
 */
async function fetchSleepData(date) {
  try {
    if (!accessToken) {
      throw new Error("Fitbit API not authenticated.");
    }

    const response = await client.get(
      "/1.2/user/-/sleep/date/" + date + ".json",
      accessToken
    );
    return response[0];
  } catch (error) {
    console.error("Error fetching sleep data:", error.message);
    throw error;
  }
}

module.exports = {
  authenticateFitbit,
  extractAccessToken,
  setAccessToken,
  fetchDailyMetrics,
  fetchSleepData,
};
