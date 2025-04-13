import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (_, { voice, input }) => {
    try {
      if (!input || input.trim() === "") {
        throw new Error("Empty input text provided");
      }
      
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice as SpeechCreateParams["voice"],
        input,
      });

      const buffer = await mp3.arrayBuffer();
      return buffer;
    } catch (error) {
      console.error("Error generating audio:", error);
      throw new Error(`Failed to generate audio: ${(error as Error).message}`);
    }
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (_, { prompt }) => {
    try {
      if (!prompt || prompt.trim() === "") {
        throw new Error("Empty prompt provided");
      }
      
      const finalPrompt = prompt + " don't include text";
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: finalPrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const url = response.data[0]?.url;

      if (!url) {
        throw new Error("No image URL was generated");
      }

      try {
        const imageResponse = await fetch(url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
        }
        const buffer = await imageResponse.arrayBuffer();
        return buffer;
      } catch (fetchError) {
        console.error("Error fetching generated image:", fetchError);
        throw new Error(`Failed to fetch generated image: ${(fetchError as Error).message}`);
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      throw new Error(`Failed to generate thumbnail: ${(error as Error).message}`);
    }
  },
});
