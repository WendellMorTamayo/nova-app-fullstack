"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, AlertCircle, Loader2 } from "lucide-react";
import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";
import { useToast } from "@/components/ui/use-toast";

export function PaymentUI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const pay = useAction(api.stripe.pay);
  const isSubscribed = useIsSubscribed();

  async function handleUpgradeClick() {
    try {
      setIsLoading(true);
      setError(null);
      const result = await pay();
      
      if (typeof result === 'object' && result.error) {
        setError(result.message);
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: result.message || "Failed to initiate payment",
        });
        return;
      }
      
      window.location.href = result;
    } catch (err) {
      const errorMessage = (err as Error).message || "Something went wrong";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Card className="w-full bg-card shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 pb-8">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center">
            {isSubscribed ? "Premium Subscription" : "Upgrade to Premium"}
            {isSubscribed && (
              <Badge variant="default" className="ml-2 bg-green-600">
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-sm md:text-base mt-1">
            {isSubscribed 
              ? "You have access to all premium features" 
              : "Unlock AI podcast creation and premium features"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && (
            <div className="bg-destructive/20 p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {isSubscribed ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span>Premium Plan</span>
                  <span className="font-medium">$4.00/month</span>
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 mr-3 text-green-500" />
                  <span>AI Podcast Creation</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 mr-3 text-green-500" />
                  <span>High-Quality Audio</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 mr-3 text-green-500" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 mr-3 text-green-500" />
                  <span>Exclusive Content</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="w-5 h-5 mr-3 text-green-500" />
                  <span>Ad-Free Experience</span>
                </li>
              </ul>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 pt-6">
          {isSubscribed ? (
            <Button 
              className="w-full bg-muted hover:bg-muted/80 text-foreground"
              disabled={true}
            >
              Already Subscribed
            </Button>
          ) : (
            <Button 
              onClick={handleUpgradeClick} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Upgrade for $4/month
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default PaymentUI;