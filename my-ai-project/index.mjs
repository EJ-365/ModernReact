import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAhRsFwmoWklnzgVCSSV-o_cJnXQ0SdL1Y" });

// Export the function to be used by server.mjs
export async function generateAIResponse(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error.message);
    if (error.response) {
      console.error("API Response:", error.response.data);
    }
    throw new Error("Failed to generate AI response");
  }
}

// Original main function for testing
async function main() {
  try {
    const response = await generateAIResponse("What do you think about humans");
    console.log(response);
  } catch (error) {
    console.error("Failed to execute main function:", error.message);
  }
}

// Only run main if this file is executed directly
if (import.meta.url === import.meta.main) {
  await main();
}
