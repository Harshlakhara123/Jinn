import { firecrawl } from "@/lib/firecrawl";
import { inngest } from "./client";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const URL_Legex = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
    { id: "demo-generate" },
    { event: "demo/generate"},
    async ({ event , step }) => {
        const {prompt} = event.data as { prompt: string};

        const urls = await step.run("extract-urls", async () => {
            return prompt.match(URL_Legex) ?? [];
        }) as string[];

        const scrapedContent = await step.run("scrape-urls", async () => {
            const results = await Promise.all(
                urls.map(async (url) => {
                    const result = await firecrawl.scrape(
                        url,
                    );
                    return result.markdown ?? null;
                })
            );
            return results.filter(Boolean).join("\n\n");
        });

        const finalPrompt = scrapedContent
            ? `Content:\n${scrapedContent}\n\nQuestion: ${prompt}`
            : prompt;

        await step.run("Generate-text", async () => {
            return await generateText({
                model: google('gemini-2.5-flash'),
                prompt: finalPrompt,
            });
        });
    },
);