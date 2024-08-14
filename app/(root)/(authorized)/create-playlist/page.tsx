"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
const formSchema = z.object({
  playlistName: z.string().min(1),
});

const CreatePlaylist = () => {
  const router = useRouter();
  const createPlaylist = useMutation(api.news.createPlaylist);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playlistName: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await createPlaylist({ playlistName: data.playlistName });
    router.push("/playlist");
  }

  return (
    <section className="mt-10 flex flex-col">
      <h1 className="text-2xl font-bold text-white-1">Create News</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-12 flex w-full flex-col"
        >
          <div className="flex flex-col gap-[30px] border-b border-black-5 pb-10">
            <FormField
              control={form.control}
              name="playlistName"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2.5">
                  <FormLabel className="text-16 font-bold text-white-1">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Playlist"
                      {...field}
                      className="input-class focus-visible:ring-orange-1"
                    />
                  </FormControl>

                  <FormMessage className="text-white-1" />
                </FormItem>
              )}
            />

            <div className="mt-10 w-full">
              <Button
                type="submit"
                className="text-16 w-full bg-purple-1 py-4 font-extrabold text-white-1 transition-all duration-500 hover:bg-black-1"
              >
                Create Playlist
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreatePlaylist;
