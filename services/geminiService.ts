
import { GoogleGenAI, Modality, Part, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};


export const editImageWithPrompt = async (
    prompt: string,
    imageFile: File,
    additionalImages: File[] = []
): Promise<string> => {
    const parts: Part[] = [];

    // Add the primary image (product)
    const imageBase64 = await blobToBase64(imageFile);
    parts.push({
        inlineData: { data: imageBase64, mimeType: imageFile.type },
    });

    // Add additional images
    for (const img of additionalImages) {
        const imgBase64 = await blobToBase64(img);
        parts.push({
            inlineData: { data: imgBase64, mimeType: img.type },
        });
    }

    // Add the text prompt
    parts.push({ text: prompt });


    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    // Check for image data in a successful response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    // If no image data, check for safety blocking or other issues
    if (response.promptFeedback?.blockReason) {
        let reason = response.promptFeedback.blockReason.toLowerCase().replace(/_/g, ' ');
        
        // Check for specific safety rating issues
        const safetyIssues = response.promptFeedback.safetyRatings
            ?.filter(rating => rating.probability === 'MEDIUM' || rating.probability === 'HIGH')
            .map(rating => rating.category.replace('HARM_CATEGORY_', '').toLowerCase().replace(/_/g, ' '));
        
        let errorMessage = `Request was blocked due to ${reason}.`;
        if (safetyIssues && safetyIssues.length > 0) {
            errorMessage += ` The content was flagged for: ${safetyIssues.join(', ')}.`;
        }
        errorMessage += " Please adjust your prompt or use a different image.";
        throw new Error(errorMessage);
    }

    // Generic fallback error if the response is unexpected
    throw new Error("No image was generated. The model may have refused the request. Please try a different prompt or image.");
};
