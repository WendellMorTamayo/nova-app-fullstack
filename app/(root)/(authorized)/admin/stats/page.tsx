"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import AdminDashboard from "@/components/admin/AdminDashboard"; // You'd create this component with your dashboard content

export default function StatsPage() {
  // First, just check if the current user is an admin
  const userData = useQuery(api.users.getUser);
  const isAdmin = userData?.accountType === "admin";
  
  // Track if initial user data check is complete
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  
  // Set initial check complete after user data is loaded
  useEffect(() => {
    if (userData !== undefined) {
      // Delay the check slightly to prevent flash
      const timer = setTimeout(() => {
        setInitialCheckComplete(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [userData]);

  // Loading state - show a loading indicator
  if (!initialCheckComplete) {
    return (
      <div className="container mx-auto py-20 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }
  
  // If user is not an admin, show unauthorized message
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-20 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Unauthorized Access</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          You don't have permission to view this page. Only administrators can access analytics.
        </p>
        <Link href="/" className="text-purple-500 hover:text-purple-600 flex items-center gap-2">
          <span>Return to Home</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 12L9 18M3 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    );
  }
  
  // Only if user is admin, load the dashboard which contains the admin queries
  return <AdminDashboard />;
}