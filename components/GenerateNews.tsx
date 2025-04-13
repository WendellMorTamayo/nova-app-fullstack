import { GenerateNewsProps } from "@/types";
import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import { useToast } from "@/components/ui/use-toast";

const useGenerateNews = ({
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
  setVoicePrompt,
  setNewsType,
}: GenerateNewsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getNewsAudio = useAction(api.ai.generateAudioAction);
  const getAudioUrl = useMutation(api.news.getUrl);
  const getContent = useAction(api.tasks.generateScriptAction);

  const generateNews = async () => {
    setIsGenerating(true);
    setAudio("");

    if (!voicePrompt) {
      toast({
        title: "Please provide a voice prompt",
      });
      return setIsGenerating(false);
    }

    try {
      const content = await getContent({
        prompt: voicePrompt,
      });
      const separatedContent = content?.split(">>>", 2);
      console.log("SeparatedContent:: ", separatedContent);
      if (!separatedContent) {
        toast({
          title: "error generating voice prompt",
        });
        return;
      }

      const newsType = separatedContent[0].replace(/ /g, "");
      const newVoicePrompt = separatedContent[1];

      setNewsType(newsType);
      const response = await getNewsAudio({
        voice: voiceType,
        input: newVoicePrompt,
      });
      setVoicePrompt(newVoicePrompt);
      const blob = new Blob([response], { type: "audio/mpeg" });
      const fileName = `news-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: "audio/mpeg" });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });

      setAudio(audioUrl!);
      setIsGenerating(false);
      toast({
        title: "news generated succesfully",
      });
    } catch (error) {
      console.log("Error generating news ", error);
      toast({
        title: "error generating news ",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateNews,
  };
};

const GenerateNews = (props: GenerateNewsProps) => {
  const { isGenerating, generateNews } = useGenerateNews(props);

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold dark:text-white-1 text-black-1">
          AI Prompt to Generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible: ring-orange-1 min-h-[200px]"
          placeholder="Provide Text to Generate  Audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          className={`text-16 bg-purple-1 py-4 font-bold text-white-1 relative ${isGenerating ? 'opacity-90' : ''}`}
          onClick={generateNews}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <Loader size={20} className="animate-spin" />
              <span>Generating...</span>
            </div>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      
      {isGenerating && (
        <div className="mt-6 p-3 rounded-md bg-black-2 dark:bg-black-2 bg-opacity-25 text-sm flex flex-col gap-2 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-gray-400">AI is generating your news content...</p>
          </div>
          <p className="text-xs text-gray-500">This may take up to 30 seconds</p>
        </div>
      )}
      
      {props.audio && (
        <div className="mt-5 animate-in fade-in-50 duration-300">
          <audio
            controls
            src={props.audio}
            autoPlay
            className="w-full"
            onLoadedMetadata={(e) =>
              props.setAudioDuration(e.currentTarget.duration)
            }
          />
          <p className="text-xs text-gray-400 mt-1">Audio generated successfully</p>
        </div>
      )}
    </div>
  );
};

export default GenerateNews;
