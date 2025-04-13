"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, CheckIcon } from "lucide-react";
import PaymentUI from "@/components/PaymentUI";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";

export default function SubscriptionPage() {
  const user = useQuery(api.users.getUser);
  const isSubscribed = useIsSubscribed();
  
  const subscriptionEndDate = user?.endsOn 
    ? new Date(user.endsOn).toLocaleDateString() 
    : "N/A";

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Manage your current subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  <span>Premium Plan</span>
                </div>
                <div className="flex items-center">
                  <span className={isSubscribed ? "text-green-500" : "text-red-500"}>
                    {isSubscribed ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              
              {isSubscribed && (
                <div className="flex items-center p-4 bg-muted/50 rounded-md">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Renews on {subscriptionEndDate}</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {!isSubscribed && (
            <div className="mt-6">
              <PaymentUI />
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Premium Benefits</CardTitle>
              <CardDescription>Exclusive features</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-primary" />
                  </div>
                  <span>AI Podcast Creation</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-primary" />
                  </div>
                  <span>High-Quality Audio</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-primary" />
                  </div>
                  <span>Priority Support</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-primary" />
                  </div>
                  <span>Exclusive Content</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                    <CheckIcon className="h-3 w-3 text-primary" />
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