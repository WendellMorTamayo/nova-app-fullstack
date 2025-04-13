"use client";

import {
  sidebarLinks,
  authenticatedSidebarLinks,
  adminLinks,
  createNewsLink,
} from "@/constants";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  useClerk,
  UserButton,
} from "@clerk/nextjs";
import { AnimatedLogo } from "./magicui/animated-logo";
import { Spotlight } from "./magicui/spotlight";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Authenticated, useQuery } from "convex/react";
import { useAudio } from "@/providers/AudioProvider";
import { api } from "@/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, LayoutDashboard, BarChart2 } from "lucide-react";

const LeftSidebar = () => {
  const pathName = usePathname();
  const { user } = useClerk();
  const { audio } = useAudio();
  const router = useRouter();
  
  // Get user data from Convex to check if they're an admin
  const userData = useQuery(api.users.getUser);
  const isAdmin = userData?.accountType === "admin";

  // Define user button appearance with custom menu items
  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-12 h-12 object-fit object-fit rounded-lg",
      userButtonPopoverCard: "bg-blue-100",
      userButtonPopoverActionButton: "text-red-600",
      badge: "bg-white-100",
    },
  };
  
  // Add Analytics link to user menu if admin
  const userButtonCustomMenuItems = isAdmin 
    ? [
        {
          label: "Analytics",
          url: "/admin/stats",
          iconUrl: "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/bar-chart-2.svg"
        }
      ] 
    : [];

  return (
    <section
      className={cn(
        "left_sidebar h-[calc(100vh-5px)] transition-all",
        {
          "h-[calc(100vh-140px)]": audio?.audioUrl,
          "w-[70px] md:w-auto": true,
        }
      )}
    >
      <nav className="flex flex-col gap-1">
        <div className="flex items-center justify-between w-full mb-6 ml-1">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-1 max-lg:justify-center"
          >
            <Spotlight className="rounded-full">
              <AnimatedLogo 
                width={96}
                height={64}
                title="Nova"
                titleClass="text-24 font-extrabold text-black-1 dark:text-white-1 hidden md:block ml-2"
              />
            </Spotlight>
          </Link>
        </div>

        <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm px-2 md:px-0">MENU</span>
        {sidebarLinks.map(({ route, label, imgUrl }) => {
          const isActive =
            pathName === route || pathName.startsWith(`${route}`);
          return (
            <Link
              href={route}
              key={label}
              className={cn(
                "flex gap-3 items-center py-3 md:py-4 px-2 md:px-4 justify-center md:justify-start",
                { 
                  "dark:bg-nav-focus-dark bg-nav-focus-light border-r-2 md:border-r-8 border-[#5C67DE]": isActive 
                }
              )}
            >
              <div className="w-6 h-6 flex-shrink-0 flex justify-center items-center">
                {label === "Discover" && (
                  <svg viewBox="0 0 24 24" width="24" height="24" className="text-gray-700 dark:text-white-1 fill-current">
                    <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12 5C13.1046 5 14 5.89543 14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5ZM12 15C13.1046 15 14 15.8954 14 17C14 18.1046 13.1046 19 12 19C10.8954 19 10 18.1046 10 17C10 15.8954 10.8954 15 12 15ZM17 10C18.1046 10 19 10.8954 19 12C19 13.1046 18.1046 14 17 14C15.8954 14 15 13.1046 15 12C15 10.8954 15.8954 10 17 10ZM7 10C8.10457 10 9 10.8954 9 12C9 13.1046 8.10457 14 7 14C5.89543 14 5 13.1046 5 12C5 10.8954 5.89543 10 7 10Z" />
                  </svg>
                )}
                {label === "Trending" && (
                  <svg viewBox="0 0 24 24" width="24" height="24" className="text-gray-700 dark:text-white-1 fill-current">
                    <path d="M2 2H4V20H22V22H2V2ZM14 8H16V16H14V8ZM10 11H12V16H10V11ZM18 5H20V16H18V5ZM6 13H8V16H6V13Z" />
                  </svg>
                )}
                {label === "Category" && (
                  <svg viewBox="0 0 24 24" width="24" height="24" className="text-gray-700 dark:text-white-1 fill-current">
                    <path d="M3 3C2.44772 3 2 3.44772 2 4V8C2 8.55228 2.44772 9 3 9H7C7.55228 9 8 8.55228 8 8V4C8 3.44772 7.55228 3 7 3H3ZM10 3C9.44772 3 9 3.44772 9 4V8C9 8.55228 9.44772 9 10 9H14C14.5523 9 15 8.55228 15 8V4C15 3.44772 14.5523 3 14 3H10ZM17 3C16.4477 3 16 3.44772 16 4V8C16 8.55228 16.4477 9 17 9H21C21.5523 9 22 8.55228 22 8V4C22 3.44772 21.5523 3 21 3H17ZM3 10C2.44772 10 2 10.4477 2 11V15C2 15.5523 2.44772 16 3 16H7C7.55228 16 8 15.5523 8 15V11C8 10.4477 7.55228 10 7 10H3ZM10 10C9.44772 10 9 10.4477 9 11V15C9 15.5523 9.44772 16 10 16H14C14.5523 16 15 15.5523 15 15V11C15 10.4477 14.5523 10 14 10H10ZM17 10C16.4477 10 16 10.4477 16 11V15C16 15.5523 16.4477 16 17 16H21C21.5523 16 22 15.5523 22 15V11C22 10.4477 21.5523 10 21 10H17ZM3 17C2.44772 17 2 17.4477 2 18V22C2 22.5523 2.44772 23 3 23H7C7.55228 23 8 22.5523 8 22V18C8 17.4477 7.55228 17 7 17H3ZM10 17C9.44772 17 9 17.4477 9 18V22C9 22.5523 9.44772 23 10 23H14C14.5523 23 15 22.5523 15 22V18C15 17.4477 14.5523 17 14 17H10ZM17 17C16.4477 17 16 17.4477 16 18V22C16 22.5523 16.4477 23 17 23H21C21.5523 23 22 22.5523 22 22V18C22 17.4477 21.5523 17 21 17H17Z" />
                  </svg>
                )}
              </div>
              <p className="hidden md:block">{label}</p>
            </Link>
          );
        })}
        <Authenticated>
          <Separator className="bg-gray-300 dark:bg-gray-1 overflow-auto justify-center items-center my-5 mx--5 w-[90%] flex" />
          <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm px-2 md:px-0">LIBRARY</span>
          {authenticatedSidebarLinks.map(({ route, label, imgUrl }) => {
            const isActive =
              pathName === route || pathName.startsWith(`${route}`);
            const isSubscription = label === "Subscription";
            
            return (
              <Link
                href={route}
                key={label}
                className={cn(
                  "flex gap-3 items-center py-3 md:py-4 px-2 md:px-4 justify-center md:justify-start",
                  { 
                    "dark:bg-nav-focus-dark bg-nav-focus-light border-r-2 md:border-r-8": isActive,
                    "border-[#5C67DE]": isActive && !isSubscription,
                    "dark:border-white border-gray-900": isActive && isSubscription
                  }
                )}
              >
                <div className="w-6 h-6 flex-shrink-0 flex justify-center items-center">
                  {label === "Recent" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-700 dark:text-white-1 fill-current">
                      <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM13 12V7H11V14H17V12H13Z" />
                    </svg>
                  )}
                  {label === "Likes" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-700 dark:text-white-1 fill-current">
                      <path d="M12.001 4.52853C14.35 2.42 17.98 2.49 20.2426 4.75736C22.5053 7.02472 22.583 10.637 20.4786 12.993L11.9999 21.485L3.52138 12.993C1.41705 10.637 1.49571 7.01901 3.75736 4.75736C6.02157 2.49315 9.64519 2.41687 12.001 4.52853Z" />
                    </svg>
                  )}
                  {label === "Subscription" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-700 dark:text-white-1">
                      <path d="M3 10H21M7 15H8M12 15H13M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <p className="hidden md:block">{label}</p>
              </Link>
            );
          })}
          <Separator className="bg-gray-300 dark:bg-gray-1 h-[0.5px] overflow-auto justify-center items-center my-5 mx--5 w-[90%] flex" />
          
          {/* Admin Dropdown Menu */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex gap-3 items-center w-full py-3 md:py-4 px-2 md:px-4 justify-center md:justify-start",
                  { 
                    "dark:bg-nav-focus-dark bg-nav-focus-light border-r-2 md:border-r-8 border-purple-500": 
                      pathName === "/admin/stats" || 
                      pathName === "/create-news" || 
                      pathName.startsWith("/admin/")
                  }
                )}>
                  <div className="w-6 h-6 flex-shrink-0 flex justify-center items-center">
                    <LayoutDashboard className="w-5 h-5 text-gray-700 dark:text-white-1" />
                  </div>
                  <span className="hidden md:block">Admin</span>
                  <ChevronDown className="hidden md:block ml-auto h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
                <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Create News Option */}
                <DropdownMenuItem onClick={() => router.push(createNewsLink.route)} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>{createNewsLink.label}</span>
                </DropdownMenuItem>
                
                {/* Analytics Option */}
                <DropdownMenuItem onClick={() => router.push("/admin/stats")} className="cursor-pointer">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Other Admin Links */}
                {adminLinks.map(({ route, label }) => {
                  // Skip Analytics since we already added it above
                  if (label === "Analytics" || label === "Stats") return null;
                  
                  return (
                    <DropdownMenuItem 
                      key={label} 
                      onClick={() => router.push(route)}
                      className="cursor-pointer"
                    >
                      <div className="w-4 h-4 mr-2 flex-shrink-0 flex justify-center items-center">
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-gray-700 dark:text-white-1 fill-current">
                          <path d="M3 3H11V11H3V3ZM3 13H11V21H3V13ZM13 3H21V11H13V3ZM13 13H21V21H13V13Z" />
                        </svg>
                      </div>
                      <span>{label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </Authenticated>
      </nav>
      <SignedOut>
        <div className="flex justify-center w-full pb-8 md:pb-14 px-2 md:px-4">
          <Button asChild className="text-xs md:text-sm w-full bg-purple-1 font-bold md:font-extrabold">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col items-center">
          <div
            className={"flex flex-row mb-8 md:mb-12 mx-2 mt-5 md:mr-6 justify-center md:justify-start"}
          >
            <UserButton 
              appearance={userButtonAppearance}
              customMenuItems={userButtonCustomMenuItems}
            />
            <div className="flex-col mx-4 hidden md:flex">
              <span className="truncate max-w-[120px]">{user?.fullName}</span>
              <div className="flex flex-col space-y-1">
                <Link
                  href={`/profile/${user?.id}`}
                  className="underline cursor-pointer text-gray-1 font-extralight text-sm"
                >
                  View profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </section>
  );
};

export default LeftSidebar;