import fetch from "node-fetch";

export const callGemini = async (prompt) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!data.candidates || !data.candidates[0])
    throw new Error("Gemini response failed");

  return data.candidates[0].content.parts[0].text;
};
