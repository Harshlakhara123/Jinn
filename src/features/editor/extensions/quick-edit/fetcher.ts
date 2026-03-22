import ky from "ky";
import { toast } from "sonner";
import { z } from "zod";

const editRequestSchema = z.object({
    selectedCode: z.string(),
    fullCode: z.string(),
    instruction: z.string(),
});


const editResponseSchema = z.object({
    editedCode: z.string(),
});

type EditRequest = z.infer<typeof editRequestSchema>;
type EditResponse = z.infer<typeof editResponseSchema>;

export const fetcher = async (
    payload: EditRequest,
    signal: AbortSignal,
): Promise<string | null> => {
    try {
        const validatedPayload = editRequestSchema.parse(payload);

        const response = await ky
            .post("/api/quick-edit", {
                json: validatedPayload,
                signal,
                timeout: 10_000,
                retry: 0,
            })
            .json<EditResponse>();

        const validatedResponse = editResponseSchema.parse(response);

        return validatedResponse.editedCode || null;
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

        toast.error("Failed to fetch AI quick-edits");
        console.error(error);
        return null;
    }
}