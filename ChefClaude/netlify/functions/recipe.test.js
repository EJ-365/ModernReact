import assert from "node:assert/strict"
import test from "node:test"
import { createRecipeHandler } from "./recipe.js"

function postRecipeEvent(ingredients) {
    return {
        httpMethod: "POST",
        body: JSON.stringify({ ingredients }),
    }
}

test("returns a generated recipe from a server-side token", async () => {
    let capturedRequest
    const handler = createRecipeHandler({
        getToken: () => "server-only-token",
        chatCompletion: async (request) => {
            capturedRequest = request
            return {
                choices: [
                    {
                        message: {
                            content: "## Tomato Rice\n\nCook rice with tomatoes.",
                        },
                    },
                ],
            }
        },
    })

    const response = await handler(postRecipeEvent([" rice ", "tomatoes", "beans"]))
    const payload = JSON.parse(response.body)

    assert.equal(response.statusCode, 200)
    assert.equal(payload.recipe, "## Tomato Rice\n\nCook rice with tomatoes.")
    assert.equal(capturedRequest.model, "meta-llama/Llama-3.1-8B-Instruct")
    assert.match(capturedRequest.messages[1].content, /rice, tomatoes, beans/)
})

test("rejects malformed ingredient payloads before calling the AI service", async () => {
    let called = false
    const handler = createRecipeHandler({
        getToken: () => "server-only-token",
        chatCompletion: async () => {
            called = true
        },
    })

    const response = await handler({
        httpMethod: "POST",
        body: JSON.stringify({ ingredients: "rice" }),
    })
    const payload = JSON.parse(response.body)

    assert.equal(response.statusCode, 400)
    assert.equal(payload.error, "Please provide at least one ingredient.")
    assert.equal(called, false)
})

test("fails closed when the server token is missing", async () => {
    let called = false
    const handler = createRecipeHandler({
        getToken: () => "",
        chatCompletion: async () => {
            called = true
        },
    })

    const response = await handler(postRecipeEvent(["rice"]))
    const payload = JSON.parse(response.body)

    assert.equal(response.statusCode, 500)
    assert.equal(payload.error, "Recipe service is not configured.")
    assert.equal(called, false)
})

test("returns a gateway error for empty AI responses", async () => {
    const handler = createRecipeHandler({
        getToken: () => "server-only-token",
        chatCompletion: async () => ({
            choices: [{ message: { content: "" } }],
        }),
    })

    const response = await handler(postRecipeEvent(["rice"]))
    const payload = JSON.parse(response.body)

    assert.equal(response.statusCode, 502)
    assert.equal(payload.error, "Recipe service returned an empty response.")
})
