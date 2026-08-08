export async function getRecipeFromLlama(ingredientsArr) {
    const response = await fetch("/api/recipe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: ingredientsArr }),
    })

    let data = null
    try {
        data = await response.json()
    } catch {
        throw new Error("Recipe service returned an invalid response.")
    }

    if (!response.ok) {
        throw new Error(data?.error || "Recipe service is unavailable.")
    }

    if (typeof data?.recipe !== "string" || !data.recipe.trim()) {
        throw new Error("Recipe service returned an empty recipe.")
    }

    return data.recipe
}

export const getRecipeFromChefClaude = getRecipeFromLlama