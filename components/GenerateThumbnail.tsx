import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { GenerateThumbnailProps } from "@/types";
import { Loader } from "lucide-react";
import { Input } from "./ui/input";
import Image from "next/image";
import { useToast } from "./ui/use-toast";
import { useAction, useMutation } from "convex/react";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";

const GenerateThumbnail = ({
  setImage,
  setImageStorageId,
  image,
  imagePrompt,
  setImagePrompt,
}: GenerateThumbnailProps) => {
  const [isAiThumbnail, setIsAiThumbnail] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getImageUrl = useMutation(api.news.getUrl);
  const handleGenerateThumbnail = useAction(api.ai.generateThumbnailAction);

  const handleImage = async (blob: Blob, fileName: string) => {
    setIsImageLoading(true);
    setImage("");

    try {
      const file = new File([blob], fileName, { type: "image/png" });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setImageStorageId(storageId);

      const imageUrl = await getImageUrl({ storageId });

      setImage(imageUrl!);
      setIsImageLoading(false);
      toast({
        title: "Thumbnail generated successfully",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error generating thumbnail",
        variant: "destructive",
      });
    }
  };
  const generateImage = async () => {
    try {
      const response = await handleGenerateThumbnail({ prompt: imagePrompt });
      const blob = new Blob([response], { type: "image/png" });
      handleImage(blob, `thumbnail-${uuidv4()}.png`);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error generating thumbnail",
        variant: "destructive",
      });
    }
  };
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    try {
      const files = e.target.files;
      if (!files) return;

      const file = files[0];
      const blob = await file.arrayBuffer().then((ab) => new Blob([ab]));
      handleImage(blob, file.name);
    } catch (error) {
      toast({
        title: "Error uploading image",
        variant: "destructive",
      });
    }
  };
  return (
    <>
      <div className="generate_thumbnail">
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiThumbnail(true)}
          className={cn("", { "bg-black-6": isAiThumbnail })}
        >
          Use AI to Generate Thumbnail
        </Button>
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiThumbnail(false)}
          className={cn("", { "bg-black-6": !isAiThumbnail })}
        >
          Upload Custom Image
        </Button>
      </div>
      {isAiThumbnail ? (
        <div className="flex flex-col gap-5">
          <div className="mt-5 flex flex-col gap-2.5">
            <Label className="text-16 font-bold dark:text-white-1 text-black-1">
              AI Prompt to Generate Thumbnail
            </Label>
            <Textarea
              className="input-class font-light focus-visible: ring-orange-1"
              placeholder="Describe the image you want to generate"
              rows={5}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
            />
          </div>
          <div className="mt-5 w-full max-w-[200px]">
            <Button
              className={`text-16 bg-orange-1 py-4 font-bold text-white-1 relative ${isImageLoading ? 'opacity-90' : ''}`}
              onClick={generateImage}
              disabled={isImageLoading}
            >
              {isImageLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader size={20} className="animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Thumbnail"
              )}
            </Button>
            {isImageLoading && (
              <div className="mt-3 p-3 rounded-md bg-black-2 dark:bg-black-2 bg-opacity-25 text-sm flex flex-col gap-2 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-gray-400">AI is creating your thumbnail...</p>
                </div>
                <p className="text-xs text-gray-500">This may take up to 20 seconds</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="image_div" onClick={() => imageRef?.current?.click()}>
          <Input
            type="file"
            className="hidden"
            ref={imageRef}
            onChange={(e) => uploadImage(e)}
          />
          {!isImageLoading ? (
            <div className="flex flex-col items-center">
              <Image
                src="/download 2.svg"
                width={40}
                height={40}
                alt="download"
                className="mb-2"
              />
              <span className="text-xs text-gray-400">Click or drop image here</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Loader size={28} className="animate-spin text-purple-1" />
              <div className="text-sm flex-center font-medium text-white-1">
                Uploading image...
              </div>
              <div className="w-32 h-1.5 bg-black-6 dark:bg-black-6 rounded-full overflow-hidden">
                <div className="h-full bg-purple-1 w-1/3 animate-pulse rounded-full"></div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-12 font-bold text-purple-1">Click to upload</h2>
            <p className="text-12 font-normal text-gray-1">
              SVG, PNG, JPEG, or GIF (max 1080x1080)
            </p>
          </div>
        </div>
      )}
      {image && (
        <div className="flex-center w-full mt-6 animate-in fade-in-50 duration-300">
          <div className="relative overflow-hidden rounded-lg border-2 border-gray-300 dark:border-black-6 shadow-md">
            <div className="absolute top-2 right-2 bg-green-600 px-2 py-1 rounded-full z-10 text-white text-xs font-medium">
              Thumbnail Ready
            </div>
            <Image
              src={image}
              width={250}
              height={250}
              className="mt-0 object-cover aspect-square"
              alt="thumbnail"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateThumbnail;
