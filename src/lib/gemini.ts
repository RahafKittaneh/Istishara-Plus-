import { GoogleGenAI } from "@google/genai";

export async function analyzeMedicalReport(base64Data: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };
  
  const textPart = {
    text: "أنت مساعد طبي ذكي. يرجى تحليل هذا التقرير الطبي وتقديم ملخص باللغة العربية يتضمن: 1) نوع الفحص، 2) النتائج الرئيسية، 3) التوصيات العامة. اجعل الأسلوب مهنياً وواضحاً.",
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("فشل تحليل التقرير الطبي. يرجى المحاولة مرة أخرى.");
  }
}
