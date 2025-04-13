# Statistics Page Development

## Overview

The Nova app currently lacks a comprehensive statistics dashboard for tracking key metrics. This document outlines the implementation of a new statistics page using shadcn UI components that will display critical business and usage data.

## Data Requirements

1. **User Metrics**
   - Total registered users
   - Active users (daily, weekly, monthly)
   - User growth over time
   - Premium conversion rate

2. **Content Metrics**
   - Total podcasts created
   - Most popular podcasts
   - Total listening time
   - Average podcast duration

3. **Financial Metrics**
   - Monthly recurring revenue (MRR)
   - Subscription conversion rate
   - Churn rate
   - Lifetime value (LTV)

4. **Platform Metrics**
   - AI generation statistics
   - System performance
   - Error rates
   - Average response times

## Backend Implementation

### 1. Create Stats API Endpoints

```typescript
// convex/stats.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // Verify admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user || user.accountType !== "admin") {
      throw new Error("Not authorized");
    }
    
    // Get user stats
    const totalUsers = await ctx.db.query("users").count();
    const premiumUsers = await ctx.db
      .query("users")
      .filter((q) => q.gt(q.field("endsOn"), Date.now()))
      .count();
    
    const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
    
    // Get content stats
    const totalNews = await ctx.db.query("news").count();
    const totalViews = await ctx.db
      .query("news")
      .aggregate((a) => ({
        views: a.sum(a.field("views")),
      }))
      .then((result) => result?.views || 0);
    
    // Get time-based metrics
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const newUsersLastMonth = await ctx.db
      .query("users")
      .filter((q) => q.gt(q.field("_creationTime"), oneMonthAgo))
      .count();
      
    const newNewsLastMonth = await ctx.db
      .query("news")
      .filter((q) => q.gt(q.field("_creationTime"), oneMonthAgo))
      .count();
    
    // Return compiled stats
    return {
      users: {
        total: totalUsers,
        premium: premiumUsers,
        conversionRate: conversionRate.toFixed(2),
        newLastMonth: newUsersLastMonth,
      },
      content: {
        totalNews,
        totalViews,
        newLastMonth: newNewsLastMonth,
        avgViewsPerNews: totalNews > 0 ? (totalViews / totalNews).toFixed(2) : 0,
      },
      financial: {
        mrr: premiumUsers * 4, // $4 per premium user
        estimatedAnnualRevenue: premiumUsers * 4 * 12,
      },
    };
  },
});

export const getUserGrowthData = query({
  args: { period: v.string() },
  handler: async (ctx, args) => {
    // Verify admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user || user.accountType !== "admin") {
      throw new Error("Not authorized");
    }
    
    const now = Date.now();
    let timePoints: number[] = [];
    let labels: string[] = [];
    
    // Calculate time points based on period
    if (args.period === "week") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        timePoints.push(date.getTime());
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      }
    } else if (args.period === "month") {
      // Last 30 days, weekly points
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
        timePoints.push(date.getTime());
        labels.push(`Week ${4-i+1}`);
      }
    } else if (args.period === "year") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        timePoints.push(date.getTime());
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
      }
    }
    
    // Calculate cumulative users at each time point
    const userData = await Promise.all(
      timePoints.map(async (time) => {
        const count = await ctx.db
          .query("users")
          .filter((q) => q.lte(q.field("_creationTime"), time))
          .count();
        return count;
      })
    );
    
    return {
      labels,
      data: userData,
    };
  },
});

export const getContentMetrics = query({
  handler: async (ctx) => {
    // Verify admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user || user.accountType !== "admin") {
      throw new Error("Not authorized");
    }
    
    // Get top content by views
    const topNewsByViews = await ctx.db
      .query("news")
      .order("desc", (q) => q.field("views"))
      .take(10);
      
    // Get news by type
    const allNews = await ctx.db.query("news").collect();
    
    const newsByType: Record<string, number> = {};
    allNews.forEach((news) => {
      if (newsByType[news.newsType]) {
        newsByType[news.newsType]++;
      } else {
        newsByType[news.newsType] = 1;
      }
    });
    
    // Format for chart display
    const typeLabels = Object.keys(newsByType);
    const typeData = typeLabels.map((type) => newsByType[type]);
    
    return {
      topNews: topNewsByViews.map((news) => ({
        id: news._id,
        title: news.newsTitle,
        views: news.views,
        author: news.author,
      })),
      newsByType: {
        labels: typeLabels,
        data: typeData,
      },
    };
  },
});

export const getPaymentStats = query({
  handler: async (ctx) => {
    // Verify admin permissions
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("clerkId", identity.subject))
      .unique();
      
    if (!user || user.accountType !== "admin") {
      throw new Error("Not authorized");
    }
    
    // Get payment data (would be implemented once payment schema is updated)
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    // Calculate monthly revenue if we had payment records
    // For now, we'll estimate based on active subscriptions
    const activeSubscriptions = await ctx.db
      .query("users")
      .filter((q) => q.gt(q.field("endsOn"), now))
      .count();
    
    const monthlyRevenue = activeSubscriptions * 4; // $4 per subscription
    
    // Monthly data (placeholder with estimated values)
    const monthlyData = [
      { month: 'Jan', revenue: monthlyRevenue * 0.7 },
      { month: 'Feb', revenue: monthlyRevenue * 0.8 },
      { month: 'Mar', revenue: monthlyRevenue * 0.9 },
      { month: 'Apr', revenue: monthlyRevenue * 0.95 },
      { month: 'May', revenue: monthlyRevenue },
      { month: 'Jun', revenue: monthlyRevenue * 1.1 },
    ];
    
    return {
      currentMRR: monthlyRevenue,
      estimatedAnnualRevenue: monthlyRevenue * 12,
      activeSubscriptions,
      revenueData: {
        labels: monthlyData.map(d => d.month),
        data: monthlyData.map(d => d.revenue),
      }
    };
  },
});
```

## Frontend Implementation

### 1. Stats Dashboard Page

```tsx
// app/(root)/(authorized)/admin/stats/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  PieChart 
} from "@/components/ui/charts"; // These would be custom shadcn-styled chart components
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Headphones, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { useState } from "react";

export default function StatsPage() {
  const [growthPeriod, setGrowthPeriod] = useState("month");
  
  const dashboardStats = useQuery(api.stats.getDashboardStats);
  const userGrowth = useQuery(api.stats.getUserGrowthData, { period: growthPeriod });
  const contentMetrics = useQuery(api.stats.getContentMetrics);
  const paymentStats = useQuery(api.stats.getPaymentStats);
  
  const isLoading = !dashboardStats || !userGrowth || !contentMetrics || !paymentStats;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Nova Analytics Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard 
              title="Total Users"
              value={dashboardStats.users.total.toString()}
              description={`+${dashboardStats.users.newLastMonth} this month`}
              icon={<Users className="h-5 w-5" />}
              trend="up"
            />
            <StatsCard 
              title="Premium Users"
              value={dashboardStats.users.premium.toString()}
              description={`${dashboardStats.users.conversionRate}% conversion`}
              icon={<CreditCard className="h-5 w-5" />}
              trend="up"
            />
            <StatsCard 
              title="Total Podcasts"
              value={dashboardStats.content.totalNews.toString()}
              description={`+${dashboardStats.content.newLastMonth} this month`}
              icon={<Headphones className="h-5 w-5" />}
              trend="up"
            />
            <StatsCard 
              title="Monthly Revenue"
              value={`$${dashboardStats.financial.mrr}`}
              description={`$${dashboardStats.financial.estimatedAnnualRevenue} annually`}
              icon={<TrendingUp className="h-5 w-5" />}
              trend="up"
            />
          </div>
          
          {/* Tabs for different stat sections */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
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
                  <CardDescription>
                    <div className="flex space-x-2">
                      <Button 
                        variant={growthPeriod === "week" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setGrowthPeriod("week")}
                      >
                        Week
                      </Button>
                      <Button 
                        variant={growthPeriod === "month" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setGrowthPeriod("month")}
                      >
                        Month
                      </Button>
                      <Button 
                        variant={growthPeriod === "year" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setGrowthPeriod("year")}
                      >
                        Year
                      </Button>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <LineChart
                    data={{
                      labels: userGrowth.labels,
                      datasets: [
                        {
                          label: "Users",
                          data: userGrowth.data,
                          borderColor: "hsl(262, 80%, 50%)",
                          backgroundColor: "hsla(262, 80%, 50%, 0.1)",
                        },
                      ],
                    }}
                    height={300}
                  />
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
                    {/* Placeholder for retention metrics */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content by Type</CardTitle>
                    <CardDescription>
                      Distribution of podcast categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart
                      data={{
                        labels: contentMetrics.newsByType.labels,
                        datasets: [
                          {
                            data: contentMetrics.newsByType.data,
                            backgroundColor: [
                              "hsl(262, 80%, 50%)",
                              "hsl(212, 80%, 50%)",
                              "hsl(352, 80%, 50%)",
                              "hsl(172, 80%, 50%)",
                              "hsl(42, 80%, 50%)",
                            ],
                          },
                        ],
                      }}
                      height={250}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Content</CardTitle>
                    <CardDescription>
                      Most viewed podcasts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {contentMetrics.topNews.slice(0, 5).map((news, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                        >
                          <div className="font-medium truncate max-w-[200px]">
                            {news.title}
                          </div>
                          <div className="flex items-center">
                            <span>{news.views} views</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Creation Over Time</CardTitle>
                  <CardDescription>
                    New podcasts created per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for content creation chart */}
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Detailed content metrics coming soon
                    </p>
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
                <CardContent className="pt-6">
                  <BarChart
                    data={{
                      labels: paymentStats.revenueData.labels,
                      datasets: [
                        {
                          label: "Revenue",
                          data: paymentStats.revenueData.data,
                          backgroundColor: "hsl(262, 80%, 50%)",
                        },
                      ],
                    }}
                    height={300}
                  />
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscriptions</CardTitle>
                    <CardDescription>
                      Active premium subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-4xl font-bold">
                        {paymentStats.activeSubscriptions}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${paymentStats.currentMRR} monthly revenue
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Annual Projection</CardTitle>
                    <CardDescription>
                      Projected annual revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-4xl font-bold">
                        ${paymentStats.estimatedAnnualRevenue}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on current MRR
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                <CardContent>
                  {/* Placeholder for performance metrics */}
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Performance metrics coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Generation</CardTitle>
                    <CardDescription>
                      AI content generation stats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for AI metrics */}
                    <div className="h-[150px] flex items-center justify-center">
                      <p className="text-muted-foreground">
                        AI usage metrics coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Error Rates</CardTitle>
                    <CardDescription>
                      System errors and failures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for error metrics */}
                    <div className="h-[150px] flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Error tracking coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
          {trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
```

### 2. Custom Chart Components

Create custom chart components using a charting library like Chart.js with shadcn UI styling:

```tsx
// components/ui/charts.tsx
"use client";

import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: ChartData<any, any, any>;
  height?: number;
  options?: ChartOptions<any>;
}

export function LineChart({ data, height = 350, options = {} }: ChartProps) {
  const { theme } = useTheme();
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    responsive: true,
    maintainAspectRatio: false,
    ...options,
  });

  useEffect(() => {
    setChartOptions({
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          },
        },
        x: {
          grid: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          },
        },
        tooltip: {
          backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
          titleColor: theme === "dark" ? "#fff" : "#000",
          bodyColor: theme === "dark" ? "#fff" : "#000",
        },
      },
    });
  }, [theme, options]);

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
}

export function BarChart({ data, height = 350, options = {} }: ChartProps) {
  const { theme } = useTheme();
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    responsive: true,
    maintainAspectRatio: false,
    ...options,
  });

  useEffect(() => {
    setChartOptions({
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          },
        },
        x: {
          grid: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          },
        },
        tooltip: {
          backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
          titleColor: theme === "dark" ? "#fff" : "#000",
          bodyColor: theme === "dark" ? "#fff" : "#000",
        },
      },
    });
  }, [theme, options]);

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
}

export function PieChart({ data, height = 350, options = {} }: ChartProps) {
  const { theme } = useTheme();
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    responsive: true,
    maintainAspectRatio: false,
    ...options,
  });

  useEffect(() => {
    setChartOptions({
      ...chartOptions,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          },
        },
        tooltip: {
          backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
          titleColor: theme === "dark" ? "#fff" : "#000",
          bodyColor: theme === "dark" ? "#fff" : "#000",
        },
      },
    });
  }, [theme, options]);

  return (
    <div style={{ height: `${height}px` }}>
      <Pie data={data} options={chartOptions} />
    </div>
  );
}
```

### 3. Update Package Dependencies

Add Chart.js to the project:

```bash
npm install chart.js react-chartjs-2
```

## Implementation Steps

1. **Backend Data Collection**
   - Implement the stats API endpoints in Convex
   - Add appropriate access control to ensure only admins can view statistics
   - Test the data collection and aggregation

2. **Frontend Dashboard**
   - Create the stats page with shadcn UI components
   - Implement the chart components for data visualization
   - Add responsive design for mobile and desktop viewing

3. **Access Control**
   - Add role-based access control to restrict the stats page to admins
   - Create navigation links to the stats page for admin users

4. **Data Refresh**
   - Implement data refresh mechanisms (e.g., polling or manual refresh)
   - Add loading and error states for data fetching

## Testing and Validation

1. **Functional Testing**
   - Verify all metrics are calculated correctly
   - Test with varying amounts of data to ensure scalability
   - Verify charts render correctly with different data sets

2. **Performance Testing**
   - Test with large data sets to ensure query performance
   - Optimize database queries for efficient data aggregation

3. **Security Testing**
   - Verify access controls prevent unauthorized access
   - Ensure sensitive financial data is properly protected

4. **Usability Testing**
   - Test on different devices and screen sizes
   - Gather feedback on the dashboard layout and visualization

## Future Enhancements

1. **Export Functionality**
   - Add CSV/PDF export for reports
   - Scheduled email reports for key metrics

2. **Advanced Analytics**
   - User cohort analysis
   - Churn prediction models
   - Conversion funnel visualization

3. **Customizable Dashboard**
   - Allow admins to customize their dashboard layout
   - Create saved reports for frequent analysis