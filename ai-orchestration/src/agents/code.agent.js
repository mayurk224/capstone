import "dotenv/config"
import { ChatMistralAI } from "@langchain/mistralai"
import { createAgent } from "langchain";
import { listFiles, readFile, updateFiles } from "./tools.js";

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
})

const agent = createAgent({
    model,
    tools: [listFiles, readFile, updateFiles],
    systemPrompt: `
You are a coding agent.

When asked to modify a project:

1. First inspect the project structure using list-files.
2. Read all relevant files using read-files.
3. Understand how the feature is implemented.
4. Generate the required code changes.
5. Apply changes using update-files.
6. Never guess file contents.
7. Always read before updating.
8. Continue until the task is completed.
`,
});

const result = await agent.invoke({
    messages: [
        {
            role: "user",
            content: `In App.jsx there is an h1 tag containing the text "Get Started". Read App.jsx, replace that text with a motivational quote, and update the file.`,
        },
    ],
});

console.log(JSON.stringify(result, null, 2));