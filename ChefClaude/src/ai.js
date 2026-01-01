import Anthropic from "@anthropic-ai/sdk"
import { HfInference } from '@huggingface/inference'

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has
could make with some or all of those ingredients. You don't need to use e
mention in your recipe. The recipe can include additional ingredients the
not to include too many extra ingredients. Format your response in markdo
render to a web page
`

// --------------------------------------------------------
// 1. ANTHROPIC (Claude) Configuration
// --------------------------------------------------------
const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
})

export async function getRecipeFromChefClaude(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ")

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
            { role: "user", content: `I have ${ingredientsString}. Please recommend I make!` },
        ],
    });
    return msg.content[0].text
}

// --------------------------------------------------------
// 2. HUGGING FACE (Mistral) Configuration
// --------------------------------------------------------
const hf = new HfInference(
    import.meta.env.VITE_HF_ACCESS_TOKEN)

export async function getRecipeFromLlama(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ")
    try {
        const response = await hf.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `I have ${ingredientsString}. Please recommend I make!` },
            ],
            max_tokens: 1024,
        })
        return response.choices[0].message.content
    } catch (err) {
        console.error(err.message)
    }
}