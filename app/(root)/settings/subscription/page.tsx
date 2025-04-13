"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, CheckIcon, SparklesIcon } from "lucide-react";
import PaymentUI from "@/components/PaymentUI";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";
import TypingAnimation from "@/components/magicui/typing-animation";
import { Spotlight } from "@/components/magicui/spotlight";

export default function SubscriptionPage() {
  const user = useQuery(api.users.getUser);
  const isSubscribed = useIsSubscribed();
  
  const subscriptionEndDate = user?.endsOn 
    ? new Date(user.endsOn).toLocaleDateString() 
    : "N/A";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12 relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white/5 bg-[radial-gradient(#8080ff_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <TypingAnimation 
          text="Subscription Management" 
          className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text mb-2"
          duration={100}
        />
        <p className="text-muted-foreground">Manage your Nova premium subscription</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Spotlight className="rounded-xl">
            <Card className="bg-black/40 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-yellow-400" />
                  Subscription Status
                </CardTitle>
                <CardDescription>
                  Manage your current subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-md bg-gradient-to-r from-purple-800/20 to-blue-800/20 border border-white/10">
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    <span>Premium Plan</span>
                  </div>
                  <div className="flex items-center">
                    <span className={isSubscribed 
                      ? "text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-medium"
                      : "text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-medium"
                    }>
                      {isSubscribed ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                
                {isSubscribed && (
                  <div className="flex items-center p-4 bg-white/5 rounded-md border border-white/10">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span>Renews on {subscriptionEndDate}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Spotlight>
          
          {!isSubscribed && (
            <div className="mt-6">
              <PaymentUI />
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                <SparklesIcon className="h-5 w-5 mr-2 text-yellow-400" />
                Premium Benefits
              </CardTitle>
              <CardDescription>Exclusive features</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-white" />
                  </div>
                  <span>AI Podcast Creation</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-white" />
                  </div>
                  <span>High-Quality Audio</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-white" />
                  </div>
                  <span>Priority Support</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-white" />
                  </div>
                  <span>Exclusive Content</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-white" />
                  </div>
                  <span>Ad-Free Experience</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}