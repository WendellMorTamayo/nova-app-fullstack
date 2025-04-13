"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useIsSubscribed } from "@/hooks/useIsSubscribed";

// PaymentSuccessContent component that uses useSearchParams
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Get subscription data from Convex
  const userData = useQuery(api.users.getUser);
  const isSubscribed = useIsSubscribed();
  
  // Display subscription end date in a readable format
  const subscriptionEndDate = userData?.endsOn 
    ? new Date(userData.endsOn).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  useEffect(() => {
    // Simulate verification until subscription data is loaded
    if (userData && !isVerifying) return;
    
    const timeout = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [userData, isVerifying]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Verifying Subscription...
            </CardTitle>
            <CardDescription className="text-center">
              Please wait while we confirm your payment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-center">
            Your premium subscription is now active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              You now have full access to all premium features including AI podcast creation, 
              high-quality audio, and exclusive content.
            </p>
            
            {isSubscribed && subscriptionEndDate && (
              <div className="bg-purple-100 dark:bg-purple-950/30 p-3 rounded-md text-center">
                <p className="text-sm font-medium">
                  Subscription active until: <span className="font-bold">{subscriptionEndDate}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => router.push("/create-news")} className="w-full sm:w-auto">
            Create a Podcast Now
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full sm:w-auto">
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Loading fallback component
function PaymentLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Loading Payment Details...
          </CardTitle>
          <CardDescription className="text-center">
            Please wait while we load your subscription information
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccess() {
  return (
    <Suspense fallback={<PaymentLoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}