"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

const ConvexClerkProvider = ({ children }: { children: ReactNode }) => (
  <ClerkProvider
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    appearance={{
      layout: {
        socialButtonsVariant: "iconButton",
        logoImageUrl: "/logo.png",
        unsafe_disableDevelopmentModeWarnings: true,
      },
      variables: {
        colorBackground: "#15171c",
        colorPrimary: "#5C67DE",
        colorText: "#ffffff",
        colorInputBackground: "#1b1f29",
        colorInputText: "#ffffff",
        colorTextSecondary: "#ffffff",
        colorTextOnPrimaryBackground: "#ffffff",
        colorNeutral: "#ffffff",
      },
    }}
  >
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  </ClerkProvider>
);

export default ConvexClerkProvider;
