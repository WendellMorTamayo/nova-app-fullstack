import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { SpeechCreateParams } from "openai/resources/audio/speech.mjs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const generateAudioAction = action({
  args: { input: v.string(), voice: v.string() },
  handler: async (_, { voice, input }) => {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as SpeechCreateParams["voice"],
      input,
    });

    const buffer = await mp3.arrayBuffer();
    return buffer;
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (_, { prompt }) => {
    const finalPrompt = prompt + " don't include text";
    prompt = finalPrompt;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const url = response.data[0].url;

    if (!url) {
      throw new Error("Error generating url");
    }

    const imageResponse = await fetch(url);
    const buffer = await imageResponse.arrayBuffer();
    return buffer;
  },
});

export const generateScriptAction = action({
  args: { prompt: v.string() },
  handler: async (_, { prompt }) => {
    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a veteran news curator and script writer and you are really good at your job",
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role: "user",
          content:
            "Based on these four categories: [sports, technology, entertainment, business] identify where the article falls into and can u curate, rephrase(as much as you can without changing the data or message) and generate a 1-3 minutes script about the given article. Please write the category on the first characters of your response and separate it with '>>>', example: technology >>> .... and please don't put any other text in your response just the given format",
        },
      ],
      model: "gpt-4o",
    });

    return response.choices[0]["message"]["content"];
  },
});
