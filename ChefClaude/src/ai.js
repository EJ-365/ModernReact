const recipeEndpoint = import.meta.env.VITE_RECIPE_API_URL || "/.netlify/functions/recipe"

async function requestRecipe(ingredientsArr) {
    const response = await fetch(recipeEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: ingredientsArr }),
    })

    let payload = {}
    try {
        payload = await response.json()
    } catch {
        // Keep the user-facing error stable when the function returns non-JSON.
    }

    if (!response.ok) {
        throw new Error(payload.error || "Recipe service is unavailable")
    }

    if (typeof payload.recipe !== "string" || payload.recipe.trim() === "") {
        throw new Error("Recipe service returned an empty response")
    }

    return payload.recipe
}

export async function getRecipeFromChefClaude(ingredientsArr) {
    return requestRecipe(ingredientsArr)
}

export async function getRecipeFromLlama(ingredientsArr) {
    return requestRecipe(ingredientsArr)
}