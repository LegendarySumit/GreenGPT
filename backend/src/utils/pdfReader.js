import pdfParse from "pdf-parse";

export const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  if (!data.text?.trim()) {
    throw new Error("This PDF contains no extractable text. It may be a scanned image — please upload a text-based PDF.");
  }
  return data.text;
};
