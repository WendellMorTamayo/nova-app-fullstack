"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CreditCard, 
  Headphones, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  SparklesIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { Spotlight } from "@/components/magicui/spotlight";
import { GridPattern } from "@/components/magicui/grid-pattern";
import TypingAnimation from "@/components/magicui/typing-animation";
import Link from "next/link";

export default function StatsPage() {
  // Fetch real data from admin query
  const statsData = useQuery(api.admin.getStats);
  const recentContent = useQuery(api.admin.getRecentContent, { limit: 10 });
  
  // Check if the current user is an admin
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
  
  // Determine if we're in loading state
  const isLoading = !statsData || !recentContent || !initialCheckComplete;
  
  // Use real data from backend if available, otherwise show placeholder
  const dashboardStats = statsData || {
    users: {
      total: 0,
      newLastMonth: 0,
      premium: 0,
      conversionRate: "0.00"
    },
    content: {
      totalNews: 0,
      newLastMonth: 0,
      avgViewsPerNews: "0.0",
      totalViews: 0
    },
    financial: {
      mrr: 0,
      estimatedAnnualRevenue: 0
    }
  };
  
  // Loading state - show a loading indicator instead of flashing unauthorized message
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
          You don&apos;t have permission to view this page. Only administrators can access analytics.
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12 relative">
        <GridPattern
          width={100}
          height={100}
          className="absolute inset-0 -z-10"
          patternColor="rgb(125, 110, 255)"
          cellThickness={0.5}
        />
        <TypingAnimation 
          text="Nova Analytics Dashboard" 
          className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text mb-2"
          duration={100}
        />
        <p className="text-muted-foreground">Track key metrics and performance data</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Spotlight className="rounded-xl">
              <StatsCard 
                title="Total Users"
                value={dashboardStats.users.total.toString()}
                description={`+${dashboardStats.users.total} this month`}
                icon={<Users className="h-5 w-5" />}
                trend="up"
              />
            </Spotlight>
            <Spotlight className="rounded-xl">
              <StatsCard 
                title="Premium Users"
                value={dashboardStats.users.premium.toString()}
                description={`${dashboardStats.users.conversionRate}% conversion`}
                icon={<CreditCard className="h-5 w-5" />}
                trend="up"
              />
            </Spotlight>
            <Spotlight className="rounded-xl">
              <StatsCard 
                title="Total Podcasts"
                value={dashboardStats.content.totalNews.toString()}
                description={`+${dashboardStats.content.newLastMonth} this month`}
                icon={<Headphones className="h-5 w-5" />}
                trend="up"
              />
            </Spotlight>
            <Spotlight className="rounded-xl">
              <StatsCard 
                title="Monthly Revenue"
                value={`$${dashboardStats.financial.mrr}`}
                description={`$${dashboardStats.financial.estimatedAnnualRevenue} annually`}
                icon={<TrendingUp className="h-5 w-5" />}
                trend="up"
              />
            </Spotlight>
          </div>
          
          {/* Tabs for different stat sections */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    User growth charts will appear here
                  </p>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                    <CardDescription>
                      Free to premium conversion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-4xl font-bold">
                        {dashboardStats.users.conversionRate}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {dashboardStats.users.premium} of {dashboardStats.users.total} users
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>User Retention</CardTitle>
                    <CardDescription>
                      Monthly active users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[150px] flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Retention metrics coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Overview</CardTitle>
                  <CardDescription>
                    Total content metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-card/50 rounded-lg border">
                      <h3 className="text-sm font-medium mb-1">Total Content</h3>
                      <p className="text-2xl font-bold">{dashboardStats.content.totalNews}</p>
                    </div>
                    <div className="p-4 bg-card/50 rounded-lg border">
                      <h3 className="text-sm font-medium mb-1">Total Views</h3>
                      <p className="text-2xl font-bold">{dashboardStats.content.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-card/50 rounded-lg border">
                      <h3 className="text-sm font-medium mb-1">Avg. Views</h3>
                      <p className="text-2xl font-bold">{dashboardStats.content.avgViewsPerNews}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-4">Recent Content</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Title</th>
                          <th className="text-left py-2 px-4 font-medium">Created</th>
                          <th className="text-right py-2 px-4 font-medium">Views</th>
                          <th className="text-right py-2 px-4 font-medium">Trending Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentContent && recentContent.length > 0 ? (
                          recentContent.map((item) => (
                            <tr key={item._id} className="border-b hover:bg-card/60">
                              <td className="py-2 px-4 text-sm truncate max-w-[250px]">{item.newsTitle}</td>
                              <td className="py-2 px-4 text-sm">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-4 text-sm text-right">{item.views}</td>
                              <td className="py-2 px-4 text-sm text-right">{item.trending_score.toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-muted-foreground">
                              {isLoading ? "Loading..." : "No content available"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>
                    Monthly recurring revenue
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Revenue charts will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>
                    API response times and error rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Performance metrics coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Helper component for stats cards
function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend 
}: { 
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/10 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 text-transparent bg-clip-text">
          {value}
        </div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === "up" && (
            <span className="bg-green-500/20 p-0.5 rounded-full mr-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            </span>
          )}
          {trend === "down" && (
            <span className="bg-red-500/20 p-0.5 rounded-full mr-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}