import { HfInference } from "@huggingface/inference"

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has
and suggests a recipe they could make with some or all of those ingredients.
You don't need to use every ingredient they mention in your recipe. The recipe
can include additional ingredients they did not mention, but try not to include
too many extra ingredients. Format your response in markdown so it can render
to a web page.
`

const MODEL = "meta-llama/Llama-3.1-8B-Instruct"
const jsonHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
}

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: jsonHeaders,
        body: JSON.stringify(body),
    }
}

function parseIngredients(body) {
    const parsedBody = body ? JSON.parse(body) : {}
    if (!Array.isArray(parsedBody.ingredients)) {
        throw new Error("Ingredients must be an array")
    }

    const ingredients = parsedBody.ingredients
        .map((ingredient) => (typeof ingredient === "string" ? ingredient.trim() : ""))
        .filter(Boolean)

    if (ingredients.length === 0) {
        throw new Error("At least one ingredient is required")
    }

    return ingredients
}

export function createRecipeHandler({
    chatCompletion,
    getToken = () => process.env.HF_ACCESS_TOKEN || process.env.VITE_HF_ACCESS_TOKEN,
} = {}) {
    return async function recipeHandler(event) {
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 204,
                headers: jsonHeaders,
                body: "",
            }
        }

        if (event.httpMethod !== "POST") {
            return jsonResponse(405, { error: "Method not allowed" })
        }

        let ingredients
        try {
            ingredients = parseIngredients(event.body)
        } catch {
            return jsonResponse(400, { error: "Please provide at least one ingredient." })
        }

        const token = getToken()
        if (!token) {
            return jsonResponse(500, { error: "Recipe service is not configured." })
        }

        const ingredientsString = ingredients.join(", ")
        const hf = chatCompletion ? null : new HfInference(token)
        const completeChat = chatCompletion || ((request) => hf.chatCompletion(request))

        try {
            const response = await completeChat({
                model: MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `I have ${ingredientsString}. Please recommend I make!` },
                ],
                max_tokens: 1024,
            })
            const recipe = response?.choices?.[0]?.message?.content

            if (typeof recipe !== "string" || recipe.trim() === "") {
                return jsonResponse(502, { error: "Recipe service returned an empty response." })
            }

            return jsonResponse(200, { recipe })
        } catch (err) {
            console.error("Recipe generation failed", err)
            return jsonResponse(502, { error: "Recipe service is unavailable." })
        }
    }
}

export const handler = createRecipeHandler()
