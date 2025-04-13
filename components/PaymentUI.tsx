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
import { Spotlight } from "@/components/magicui/spotlight";

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
      
      if (typeof result === 'string') {
        window.location.href = result;
      }
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
      {/* First wrapper with padding to make room for the badge */}
      <div className="relative mt-6 mx-2">
        {/* Badge positioned at the edge of the component with rotation */}
        {!isSubscribed && (
          <div className="absolute -top-3 -right-3 rotate-12" style={{ zIndex: 50 }}>
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-1.5 text-sm shadow-xl border-2 border-red-400">
              BEST VALUE
            </Badge>
          </div>
        )}
        
        <Spotlight className="w-full">
          <Card className="w-full bg-black/40 backdrop-blur-sm shadow-xl overflow-hidden border-[0.5px] border-white/10">
            <CardHeader className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 pb-8">
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
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-md border border-white/10">
                      <span>Premium Plan</span>
                      <span className="font-medium">$4.00/month</span>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 h-5 w-5 rounded-full flex items-center justify-center mr-3">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                      <span>AI Podcast Creation</span>
                    </li>
                    <li className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 h-5 w-5 rounded-full flex items-center justify-center mr-3">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                      <span>High-Quality Audio</span>
                    </li>
                    <li className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 h-5 w-5 rounded-full flex items-center justify-center mr-3">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                      <span>Priority Support</span>
                    </li>
                    <li className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 h-5 w-5 rounded-full flex items-center justify-center mr-3">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                      <span>Exclusive Content</span>
                    </li>
                    <li className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 h-5 w-5 rounded-full flex items-center justify-center mr-3">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                      <span>Ad-Free Experience</span>
                    </li>
                  </ul>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 pt-6">
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
                  className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 overflow-hidden"
                  disabled={isLoading}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity" />
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  <span className="relative z-10">Upgrade for $4/month</span>
                </Button>
              )}
            </CardFooter>
          </Card>
        </Spotlight>
      </div>
    </div>
  );
}

export default PaymentUI;