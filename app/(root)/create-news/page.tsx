"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { boolean, z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import GenerateNews from "@/components/GenerateNews";
import GenerateThumbnail from "@/components/GenerateThumbnail";
import { Loader } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/components/ui/use-toast";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { isPortInUse } from "@/utils/checkPort";
import CreateNewsLoading from "@/components/CreateNewsLoading";

const formSchema = z.object({
  newsTitle: z.string().min(2),
  newsDescription: z.string().min(2),
  source: z.string().optional(),
});

const CreateNews = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [audioStorageId, setAudioStorageId] = useState<Id<"_storage"> | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);

  const [voiceType, setVoiceType] = useState<string>("");
  const [newsType, setNewsType] = useState<string>("");
  const [voicePrompt, setVoicePrompt] = useState("");

  // Simulate loading state
  useEffect(() => {
    // Simulate API data loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // Show loading state for 1.2 seconds for better UX
    
    return () => clearTimeout(loadingTimer);
  }, []);
  
  const createNews = useMutation(api.news.createNews);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newsTitle: "",
      newsDescription: "",
      source: "",
    },
  });

  const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];

  // 2. Define a submit handler.
  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      if (!audioUrl || !imageUrl || !voiceType) {
        toast({
          title: "Please generate audio and Image",
        });
        setIsSubmitting(false);
        // throw new Error("Please generate audio and image");
      }

      const news = await createNews({
        newsTitle: data.newsTitle,
        newsDescription: data.newsDescription,
        audioUrl,
        imageUrl,
        voiceType,
        newsType,
        imagePrompt,
        voicePrompt,
        views: 0,
        audioDuration,
        audioStorageId: audioStorageId!,
        imageStorageId: imageStorageId!,
        source: data.source || undefined,
      });
      toast({
        title: "Successfully created news",
      });
      router.push("/");
    } catch (error) {
      // toast({
      //   title: "Server Error",
      //   variant: "destructive",
      // });
      setIsSubmitting(false);
    }
  }
  // Show skeleton loading state when page is loading
  if (isLoading) {
    return <CreateNewsLoading />;
  }

  return (
    <section className="mt-10 flex flex-col animate-in fade-in-10 duration-500">
      <h1 className="text-2xl font-bold dark:text-white-1 text-black-1">Create News</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b dark:border-black-5 border-gray-200 pb-10">
            <FormField
              control={form.control}
              name="newsTitle"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold dark:text-white-1 text-black-1">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="News"
                      {...field}
                      className="input-class focus-visible:ring-orange-1"
                    />
                  </FormControl>

                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2.5">
              <Label className="text-16 font-bold dark:text-white-1 text-black-1">
                Select AI Voice
              </Label>
              <Select onValueChange={(value) => setVoiceType(value)}>
                <SelectTrigger
                  className={cn(
                    "text-16 w-full border-none dark:bg-black-1 bg-gray-100 dark:text-gray-1 text-gray-800"
                  )}
                >
                  <SelectValue
                    placeholder="Select AI Voice"
                    className="placeholder:text-gray-1"
                  />
                </SelectTrigger>
                <SelectContent className="text-16 border-none dark:bg-black-1 bg-gray-100 font-bold dark:text-white-1 text-black-1 focus:ring-orange-1">
                  {voiceCategories.map((category) => (
                    <SelectItem
                      key={category}
                      className="capitalize focus:bg-orange-1"
                      value={category}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
                {voiceType && (
                  <audio
                    src={`/${voiceType}.mp3`}
                    autoPlay
                    className="hidden"
                  />
                )}
              </Select>
            </div>
            <FormField
              control={form.control}
              name="newsDescription"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold dark:text-white-1 text-black-1">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a short description"
                      {...field}
                      className="input-class focus-visible:ring-orange-1 min-h-[120px]"
                    />
                  </FormControl>

                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold dark:text-white-1 text-black-1">
                    Source <span className="text-sm text-gray-400">(e.g., CNN, BBC, Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter news source"
                      {...field}
                      className="input-class focus-visible:ring-orange-1"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-400">
                    Attribution helps avoid potential legal issues
                  </FormDescription>
                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col pt-10">
            <GenerateNews
              setAudioStorageId={setAudioStorageId}
              setAudio={setAudioUrl}
              voiceType={voiceType!}
              audio={audioUrl}
              voicePrompt={voicePrompt}
              setVoicePrompt={setVoicePrompt}
              setAudioDuration={setAudioDuration}
              setNewsType={setNewsType}
              newsType={""}
            />
            <GenerateThumbnail
              setImage={setImageUrl}
              setImageStorageId={setImageStorageId}
              image={imageUrl}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
            />
            <div className="mt-10 w-full">
              <Button
                type="submit"
                className={`text-16 w-full bg-purple-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1 relative ${isSubmitting ? 'opacity-90' : ''}`}
                disabled={isSubmitting || !audioUrl || !imageUrl || !voiceType}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={20} className="animate-spin" />
                    <span>Publishing your news...</span>
                  </div>
                ) : (
                  <>
                    {(!audioUrl || !imageUrl || !voiceType) ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>Complete all steps to publish</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Submit & Publish News</span>
                      </div>
                    )}
                  </>
                )}
              </Button>
              
              {/* Submission status indicators */}
              <div className="mt-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${voiceType ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-400">Voice Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${audioUrl ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-400">Audio Generated</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${imageUrl ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-400">Thumbnail Ready</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreateNews;
