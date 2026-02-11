import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";

// Define schema for AI response
const suggestionSchema = z.object({
  suggestion: z
    .string()
    .describe("The code to insert at Jinn, or empty string if no completion needed"),
});

// Prompt generator function
const SUGGESTION_PROMPT = (
  fileName: string,
  lineNumber: number,
  textBeforeCursor: string,
  textAfterCursor: string,
  previousLines: string,
  nextLines: string,
  code: string
): string => `
You are a specialized Code Completion Assistant. Your goal is to provide a seamless "ghost text" suggestion for the user's cursor position.

### CONTEXT
- **File Name:** ${fileName}
- **Cursor Position:** Line ${lineNumber}
- **Surrounding Code:**
    - **Before Cursor:** "${textBeforeCursor}"
    - **After Cursor:** "${textAfterCursor}"
- **Immediate Context:**
    - **Previous Lines:** ${previousLines}
    - **Next Lines:** ${nextLines}
- **Full File Content:**
${code}

### STRICT RULES
1. **No Duplication:** Analyze <Next Lines>. If the code the user needs is already present immediately following the cursor, return an EMPTY STRING.
2. **Completion Check:** If <Before Cursor> ends with a completed statement (e.g., \`;\`, \`}\`, or \`)\`), return an EMPTY STRING.
3. **Seamless Integration:** Provide ONLY the code that should be inserted at the cursor. Do not include explanations, markdown code blocks, or preamble.
4. **Context Awareness:** Use the <Full File Content> to ensure variable names, styles, and logic remain consistent.

### OUTPUT
Return only the raw code suggestion or an empty string.
`;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if(!userId){
      return NextResponse.json(
        {error: "Unauthorised"},
        {status: 403}
      );
    }
    const {
      fileName,
      code,
      previousLines,
      textBeforeCursor,
      textAfterCursor,
      nextLines,
      LineNumber,
    } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    // Build prompt
    const prompt = SUGGESTION_PROMPT(
      fileName,
      LineNumber,
      textBeforeCursor,
      textAfterCursor,
      previousLines || "",
      nextLines || "",
      code
    );

    // Call AI model
    const result = await generateText({
      model: google("gemini-2.5-flash-lite"),
      prompt,
    });

    // Extract raw suggestion text
    const rawSuggestion = result.text.trim();

    // Validate the response against schema
    const parsed = suggestionSchema.safeParse({ suggestion: rawSuggestion });
    if (!parsed.success) {
      console.warn("Invalid AI output:", result.text);
      return NextResponse.json({ suggestion: "" });
    }

    // Return the valid suggestion
    return NextResponse.json({ suggestion: parsed.data.suggestion });
  } catch (error) {
    console.error("Suggestion error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { error: "Failed to generate suggestion", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
