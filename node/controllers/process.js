const axios = require("axios");
const { findPlacesWithinRadius } = require("./dist.js");

const processTranscript = async (req, res) => {
  try {
    const { transcript, lat, lng } = req.body;

    // Send transcript to Flask backend
    const response = await axios.post("http://localhost:8000/process", {
      transcript,
    });
    const data = response.data;
    const depts = data.depts;

    // Call findPlacesWithinRadius for each dept and await all
    const results = await Promise.all(
      depts.map((dept) => {
        const val = findPlacesWithinRadius(lat, lng, 5000, dept);
        return val;
      })
    );

    const resultsStr = results.map((res) => res.name);

    return res.status(200).json({
      contacts: resultsStr,
      suggestion: data.suggestion,
      message: `Contacting: ${resultsStr.join(
        ", "
      )}. Till then, please take this suggestion: ${data.suggestion}`,
    });
  } catch (error) {
    console.error("Error processing transcript:", error);
    res.status(500).json({ error: "Failed to process transcript" });
  }
};

module.exports = {
  processTranscript,
};
