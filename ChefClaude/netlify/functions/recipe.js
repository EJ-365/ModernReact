/* global process */
import { HfInference } from "@huggingface/inference"

const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and
suggests a recipe they could make with some or all of those ingredients. You
can include a few additional pantry ingredients, but do not add too many extras.
Format your response in markdown so it can render on a web page.
`

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    }
}

function getIngredients(event) {
    const payload = JSON.parse(event.body || "{}")
    if (!Array.isArray(payload.ingredients)) {
        return []
    }

    return payload.ingredients
        .map((ingredient) => String(ingredient).trim())
        .filter(Boolean)
}

export async function handler(event) {
    if (event.httpMethod !== "POST") {
        return jsonResponse(405, { error: "Method not allowed." })
    }

    let ingredients
    try {
        ingredients = getIngredients(event)
    } catch {
        return jsonResponse(400, { error: "Invalid recipe request." })
    }

    if (ingredients.length < 3) {
        return jsonResponse(400, { error: "Please provide at least three ingredients." })
    }

    const hfToken = process.env.HF_ACCESS_TOKEN || process.env.VITE_HF_ACCESS_TOKEN
    if (!hfToken) {
        return jsonResponse(500, { error: "Recipe service is not configured." })
    }

    try {
        const hf = new HfInference(hfToken)
        const ingredientsString = ingredients.join(", ")
        const response = await hf.chatCompletion({
            model: HF_MODEL,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `I have ${ingredientsString}. Please recommend I make!` },
            ],
            max_tokens: 1024,
        })
        const recipe = response?.choices?.[0]?.message?.content

        if (typeof recipe !== "string" || !recipe.trim()) {
            throw new Error("Hugging Face returned an empty recipe response.")
        }

        return jsonResponse(200, { recipe })
    } catch (err) {
        console.error("Recipe generation failed:", err)
        return jsonResponse(502, { error: "Recipe service is unavailable." })
    }
}
