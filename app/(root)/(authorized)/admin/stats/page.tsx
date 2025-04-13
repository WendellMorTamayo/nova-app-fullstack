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
import { useState } from "react";
import { Spotlight } from "@/components/magicui/spotlight";
import { GridPattern } from "@/components/magicui/grid-pattern";
import TypingAnimation from "@/components/magicui/typing-animation";

export default function StatsPage() {
  // We'll mock the data now and replace with real queries later
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data - would come from backend
  const dashboardStats = {
    users: {
      total: 1250,
      newLastMonth: 128,
      premium: 175,
      conversionRate: "14.00"
    },
    content: {
      totalNews: 450,
      newLastMonth: 58,
      avgViewsPerNews: "85.5",
      totalViews: 38475
    },
    financial: {
      mrr: 700,
      estimatedAnnualRevenue: 8400
    }
  };
  
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
                description={`+${dashboardStats.users.newLastMonth} this month`}
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
                <CardContent className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Content metrics will be displayed here
                  </p>
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