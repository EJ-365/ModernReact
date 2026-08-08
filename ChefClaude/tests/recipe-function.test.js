import test from "node:test"
import assert from "node:assert/strict"
import { handler } from "../netlify/functions/recipe.js"

function clearRecipeTokens() {
    const originalTokens = {
        HF_ACCESS_TOKEN: process.env.HF_ACCESS_TOKEN,
        VITE_HF_ACCESS_TOKEN: process.env.VITE_HF_ACCESS_TOKEN,
    }

    delete process.env.HF_ACCESS_TOKEN
    delete process.env.VITE_HF_ACCESS_TOKEN

    return () => {
        if (originalTokens.HF_ACCESS_TOKEN === undefined) {
            delete process.env.HF_ACCESS_TOKEN
        } else {
            process.env.HF_ACCESS_TOKEN = originalTokens.HF_ACCESS_TOKEN
        }

        if (originalTokens.VITE_HF_ACCESS_TOKEN === undefined) {
            delete process.env.VITE_HF_ACCESS_TOKEN
        } else {
            process.env.VITE_HF_ACCESS_TOKEN = originalTokens.VITE_HF_ACCESS_TOKEN
        }
    }
}

test("recipe function rejects non-POST requests", async () => {
    const response = await handler({ httpMethod: "GET", body: "" })

    assert.equal(response.statusCode, 405)
    assert.deepEqual(JSON.parse(response.body), { error: "Method not allowed." })
})

test("recipe function rejects invalid request bodies", async () => {
    const response = await handler({ httpMethod: "POST", body: "not-json" })

    assert.equal(response.statusCode, 400)
    assert.deepEqual(JSON.parse(response.body), { error: "Invalid recipe request." })
})

test("recipe function keeps missing API tokens server-side", async () => {
    const restoreTokens = clearRecipeTokens()

    try {
        const response = await handler({
            httpMethod: "POST",
            body: JSON.stringify({ ingredients: ["rice", "beans", "tomatoes"] }),
        })

        assert.equal(response.statusCode, 500)
        assert.deepEqual(JSON.parse(response.body), {
            error: "Recipe service is not configured.",
        })
    } finally {
        restoreTokens()
    }
})
