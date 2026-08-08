import test from "node:test"
import assert from "node:assert/strict"
import { getRecipeFromLlama } from "../src/ai.js"

test("getRecipeFromLlama posts ingredients and returns the recipe", async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async (url, options) => {
        assert.equal(url, "/api/recipe")
        assert.equal(options.method, "POST")
        assert.deepEqual(JSON.parse(options.body), {
            ingredients: ["rice", "beans", "tomatoes"],
        })

        return new Response(JSON.stringify({ recipe: "## Rice and Beans" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    }

    try {
        const recipe = await getRecipeFromLlama(["rice", "beans", "tomatoes"])
        assert.equal(recipe, "## Rice and Beans")
    } finally {
        globalThis.fetch = originalFetch
    }
})

test("getRecipeFromLlama throws server errors so the UI can show fallback text", async () => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(
        JSON.stringify({ error: "Recipe service is unavailable." }),
        {
            status: 502,
            headers: { "Content-Type": "application/json" },
        },
    )

    try {
        await assert.rejects(
            () => getRecipeFromLlama(["rice", "beans", "tomatoes"]),
            /Recipe service is unavailable/,
        )
    } finally {
        globalThis.fetch = originalFetch
    }
})
