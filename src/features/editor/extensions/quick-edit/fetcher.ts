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
        if (error instanceof Error && (error as any).response) {
            try {
                const errorData = await (error as any).response.json();
                if (errorData && errorData.details) {
                    toast.error(`Suggestion Failed: ${errorData.details}`);
                    return null;
                }
            } catch (e) {
                // ignore json parse error
            }
        }

        toast.error("Failed to fetch AI quick-edits");
        console.error(error);
        return null;
    }
}