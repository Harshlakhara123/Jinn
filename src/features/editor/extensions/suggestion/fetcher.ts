import ky from "ky";
import { toast } from "sonner";
import { z } from "zod";

const suggestionRequestSchema = z.object({
    fileName: z.string(),
    code: z.string(),
    currentLine: z.string(),
    previousLines: z.string().optional().default(""),
    textBeforeCursor: z.string(),
    textAfterCursor: z.string(),
    nextLines: z.string().optional().default(""),
    LineNumber: z.number(),
});


const suggestionResponseSchema = z.object({
    suggestion: z.string(),
});

type SuggestionRequest = z.infer<typeof suggestionRequestSchema>;
type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;

export const fetcher = async (
    payload: SuggestionRequest,
    signal: AbortSignal,
): Promise<string | null> => {
    try {
        const validatedPayload = suggestionRequestSchema.parse(payload);

        const response = await ky
            .post("/api/suggestion", {
                json: validatedPayload,
                signal,
                timeout: 10_000,
                retry: 0,
            })
            .json<SuggestionResponse>();

        const validatedResponse = suggestionResponseSchema.parse(response);

        return validatedResponse.suggestion || null;
    } catch (error) {
        if ((error instanceof DOMException && error.name === "AbortError") ||
            (error instanceof Error && error.name === "AbortError")) {
            return null;
        }

        // Try to get more details if the error is an HTTP error
        if (error instanceof Error && "response" in error) {
            try {
                const errorData = await (error as { response: Response }).response.json();
                if (errorData && typeof errorData === 'object' && 'details' in errorData) {
                    toast.error(`Suggestion Failed: ${errorData.details as string}`);
                    return null;
                }
            } catch {
                // ignore json parse error
            }
        }

        toast.error("Failed to fetch AI completion");
        console.error(error);
        return null;
    }
}