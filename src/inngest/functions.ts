import { inngest } from "./client";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const demoGenerate = inngest.createFunction(
    { id: "demo-generate" },
    { event: "demo/generate"},
    async ({ step }) => {
        await step.run("Generate-text", async () => {
            return await generateText({
                model: google('gemini-2.5-flash'),
                prompt: "Write a short poem about the sea.",
            });
        });
    },
);