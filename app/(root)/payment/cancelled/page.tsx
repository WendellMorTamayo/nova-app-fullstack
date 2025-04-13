"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentCancelled() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-center">
            Your payment process was cancelled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No worries! You can still enjoy the basic features of Nova. 
            If you change your mind, you can upgrade to premium at any time.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => router.push("/")} className="w-full sm:w-auto">
            Return to Home
          </Button>
          <Button variant="outline" onClick={() => router.push("/discover")} className="w-full sm:w-auto">
            Explore Podcasts
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}