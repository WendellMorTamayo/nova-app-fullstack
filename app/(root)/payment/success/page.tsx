"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // In a real implementation, we would verify the payment with the backend
    // For now, we'll just simulate the verification
    const timeout = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [sessionId]);

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
          <p className="text-center text-muted-foreground">
            You now have full access to all premium features including AI podcast creation, 
            high-quality audio, and exclusive content.
          </p>
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