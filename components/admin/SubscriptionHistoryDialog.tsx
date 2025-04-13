"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, DollarSign, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SubscriptionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any; // User data from Convex
}

export default function SubscriptionHistoryDialog({ 
  open, 
  onOpenChange, 
  user 
}: SubscriptionHistoryDialogProps) {
  // Fetch subscription history
  const subscriptionHistory = useQuery(
    api.admin.getUserSubscriptionHistory,
    user ? { userId: user.clerkId } : "skip"
  );
  
  const isLoading = subscriptionHistory === undefined;
  
  // Format date with time
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };
  
  // Calculate time periods in a nice format
  const formatTimePeriod = (startTime: number, endTime: number) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };
  
  if (!user) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-black-1 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg z-50 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white">
            Subscription History
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Payment and subscription activity for {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Current Subscription Status */}
          <div className="mb-6 bg-gray-50 dark:bg-black-2 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              Current Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Badge 
                  className={
                    user.subscriptionStatus === "active" 
                      ? "bg-green-600" 
                      : user.subscriptionStatus === "expired" 
                        ? "bg-amber-600" 
                        : "bg-gray-600"
                  }
                >
                  {user.subscriptionStatus}
                </Badge>
                <span className="text-gray-700 dark:text-gray-300">
                  {user.subscriptionStatus === "active" 
                    ? "Subscription is active" 
                    : user.subscriptionStatus === "expired"
                      ? "Subscription has expired"
                      : "Free tier user"}
                </span>
              </div>
              
              {user.subscriptionId && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {user.endsOn 
                      ? `Expires: ${formatDateTime(user.endsOn)}` 
                      : "No expiration date"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Subscription History */}
          <div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-4">
              Payment History
            </h3>
            
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="mb-4">
                  <Skeleton className="h-36 w-full" />
                </div>
              ))
            ) : subscriptionHistory && subscriptionHistory.length > 0 ? (
              <div className="space-y-4">
                {subscriptionHistory.map((item, index) => (
                  <Card 
                    key={index} 
                    className="p-4 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-black dark:text-white">
                          {item.type === "manual" 
                            ? "Manual Extension" 
                            : "Stripe Payment"}
                        </span>
                      </div>
                      <Badge 
                        variant={item.status === "success" ? "default" : "destructive"}
                        className={item.status === "success" ? "bg-green-600" : ""}
                      >
                        {item.status === "success" ? "Successful" : "Failed"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {formatDateTime(item.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Duration: {formatTimePeriod(item.startDate, item.endDate)}
                        </span>
                      </div>
                      
                      {item.transactionId && (
                        <div className="flex items-center text-sm col-span-2 mt-1">
                          <span className="text-gray-600 dark:text-gray-400 mr-2">Transaction ID:</span>
                          <span className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">
                            {item.transactionId}
                          </span>
                        </div>
                      )}
                      
                      {item.amount && (
                        <div className="flex items-center text-sm mt-1">
                          <span className="text-gray-600 dark:text-gray-400 mr-2">Amount:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            ${item.amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="flex text-sm col-span-2 mt-1">
                          <span className="text-gray-600 dark:text-gray-400 mr-2">Notes:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No subscription history
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  This user has not made any payments or subscription changes yet.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button 
              variant="outline"
              className="bg-white dark:bg-black-3 text-black dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-black-2"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}