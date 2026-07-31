import { extractText } from "unpdf";

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  const { text } = await extractText(new Uint8Array(buffer));

  const fullText = Array.isArray(text) ? text.join("\n") : text;
  if (!fullText.trim()) {
    throw new Error(
      "Could not extract text from PDF. File may be scanned or image-based.",
    );
  }

  return fullText
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();
};
