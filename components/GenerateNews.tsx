import { GenerateNewsProps } from "@/types";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import { generateUploadUrl } from "@/convex/files";
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
  const getContent = useAction(api.ai.generateScriptAction);

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
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to Generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible: ring-orange-1"
          placeholder="Provide Text to Generate  Audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          className="text-16 bg-purple-1 py-4 font-bold text-white-1"
          onClick={generateNews}
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin mr-2" />
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) =>
            props.setAudioDuration(e.currentTarget.duration)
          }
        />
      )}
    </div>
  );
};

export default GenerateNews;
