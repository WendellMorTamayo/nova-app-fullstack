"use client";

import {
  sidebarLinks,
  authenticatedSidebarLinks,
  createNewsLink,
} from "@/constants";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  useClerk,
  UserButton,
  UserProfile,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Authenticated } from "convex/react";
import { useAudio } from "@/providers/AudioProvider";
import PricingDialog from "./PricingDialog";

const LeftSidebar = () => {
  const pathName = usePathname();
  const { user } = useClerk();
  const { audio } = useAudio();
  const router = useRouter();

  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-12 h-12 object-fit object-fit rounded-lg",
      userButtonPopoverCard: "bg-blue-100",
      userButtonPopoverActionButton: "text-red-600",
      badge: "bg-white-100",
    },
  };

  return (
    <section
      className={cn("left_sidebar h-[calc(100vh-5px)]", {
        "h-[calc(100vh-140px)]": audio?.audioUrl,
      })}
    >
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-1 pb-10 max-lg:justify-center"
        >
          <Image src="/logo.png" alt="logo" width={70} height={70}></Image>

          <h1 className="text-24 font-extrabold  text-white max-lg:hidden">
            Nova
          </h1>
        </Link>

        <span className="text-gray-400">MENU</span>
        {sidebarLinks.map(({ route, label, imgUrl }) => {
          const isActive =
            pathName === route || pathName.startsWith(`${route}`);
          return (
            <Link
              href={route}
              key={label}
              className={cn(
                "flex gap-3 items-center py-4 max-lg:px-4 justify-center lg:justify-start",
                { "bg-nav-focus border-r-8 border-[#5C67DE]": isActive }
              )}
            >
              <Image src={imgUrl} width={24} height={27} alt={imgUrl} />
              <p>{label}</p>
            </Link>
          );
        })}
        <Authenticated>
          <Separator className="bg-gray-1 overflow-auto justify-center items-center my-5 mx--5 w-[90%] flex" />
          <span className="text-gray-400">LIBRARY</span>
          {authenticatedSidebarLinks.map(({ route, label, imgUrl }) => {
            const isActive =
              pathName === route || pathName.startsWith(`${route}`);
            return (
              <Link
                href={route}
                key={label}
                className={cn(
                  "flex gap-3 items-center py-4 max-lg:px-4 justify-center lg:justify-start",
                  { "bg-nav-focus border-r-8 border-[#5C67DE]": isActive }
                )}
              >
                <Image src={imgUrl} width={24} height={27} alt={imgUrl} />
                <p>{label}</p>
              </Link>
            );
          })}
          <Separator className="bg-gray-1 h-[0.5px] overflow-auto justify-center items-center my-5 mx--5 w-[90%] flex" />

          <Link
            href={createNewsLink.route}
            key={createNewsLink.label}
            className={cn(
              "flex gap-3 items-center py-4 max-lg:px-4 justify-center lg:justify-start",
              {
                "bg-nav-focus border-r-8 border-blue-500":
                  pathName === createNewsLink.route ||
                  pathName.startsWith(`${createNewsLink.route}`),
              }
            )}
          >
            <Image
              src={createNewsLink.imgUrl}
              width={24}
              height={27}
              alt={createNewsLink.imgUrl}
            />
            <p>{createNewsLink.label}</p>
          </Link>
        </Authenticated>
      </nav>
      <SignedOut>
        <div className="flex-center w-full pb-14 max-lg:px-4 lg:pr-8">
          <Button asChild className="text-16 w-full bg-purple-1 font-extrabold">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col items-center">
          <PricingDialog />
          <div
            className={"flex flex-row mb-12 mr-6"}
          >
            <UserButton appearance={userButtonAppearance} />
            <div className="flex flex-col mx-4">
              <span>{user?.fullName}</span>
              <Link
                href={`/profile/${user?.id}`}
                className="underline cursor-pointer text-gray-1 font-extralight"
              >
                View profile
              </Link>
            </div>
          </div>
        </div>
      </SignedIn>
    </section>
  );
};

export default LeftSidebar;
