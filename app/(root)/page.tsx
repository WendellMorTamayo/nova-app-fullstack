"use client";
import LoaderSpinner from "@/components/LoaderSpinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CreateUserButton from "@/components/CreateUserButton";

const Home = () => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  // Check if user exists in Convex
  const userInDb = useQuery(
    api.users.getUserById, 
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );
  
  useEffect(() => {
    // If Clerk has loaded the user info
    if (isLoaded) {
      // If user is not signed in, redirect to discover
      if (!isSignedIn) {
        router.push("/discover");
        return;
      }
      
      // If Convex has responded about the user's existence
      if (userInDb !== undefined) {
        const userExists = userInDb !== null;
        
        // If user exists in Clerk but not in Convex, stop redirecting
        if (!userExists) {
          setIsRedirecting(false);
          return;
        }
        
        // If user exists in both Clerk and Convex, redirect to discover
        router.push("/discover");
      }
    }
  }, [router, isLoaded, userInDb, isSignedIn]);

  // If we're not redirecting, show user creation UI
  if (!isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <div className="max-w-md px-6 py-8 bg-black-2 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-4 text-white">
            Complete Your Registration
          </h1>
          <p className="text-white-2 mb-6 text-center">
            We noticed your user profile hasn't been created in our database. 
            This can happen if the Clerk webhook didn't fire correctly.
          </p>
          <div className="flex justify-center">
            <CreateUserButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderSpinner />
    </div>
  );
};

export default Home;
