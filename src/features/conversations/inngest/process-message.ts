import {inngest} from "@/inngest/client";
import {Id} from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import {api} from  "../../../../convex/_generated/api";
import {convex} from "@/lib/convex-client";

interface MessageEvent {
    messageId: Id<"messages">;
}

export const processMessage = inngest.createFunction(
    {
        id: "process-message",
        cancelOn:[
            {
                event: "message/cancel",
                if: "event.data.messageId == async.data.messageId",
            },
        ],
        onFailure: async ({event, step}) => {
            const { messageId } = event.data.event.data as MessageEvent;
            const internalKey = process.env.CONVEX_INTERNAL_KEY;

            if(internalKey){
                await step.run("update-message-on-failure", async () => {
                    await convex.mutation(api.system.updateMessageContent, {
                        internalKey,
                        messageId,
                        content: 
                        "Sorry! , I encountered an error while processing your request. Let me know if u need anything else ",
                    });
                });
            }
        }
    },
    {
        event: "message/sent",
    },
    async ({event,step}) => {
        const {
            messageId,
        } = event.data as MessageEvent;

        const internalKey = process.env.CONVEX_INTERNAL_KEY;

        if(!internalKey){
            throw new NonRetriableError("CONVEX_INTERNAL_KEY is not configured");
        }

        await step.sleep("wait-for-ai-processing", "5s");


        await step.run("update-assistant-message", async()=>{
            await convex.mutation(api.system.updateMessageContent, {
                internalKey,
                messageId,
                content: "AI processed this message(TODO)"
            })
        });

    }
);