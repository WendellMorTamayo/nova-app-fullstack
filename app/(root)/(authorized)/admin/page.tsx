"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsPage from "./stats/page";
import UserManagementTable from "@/components/admin/UserManagementTable";
import { 
  BarChart3, 
  Users,
  Newspaper,
  CreditCard,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="stats" 
            className={cn(
              "flex items-center gap-2 rounded-lg text-sm font-medium transition-all",
              "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
              "data-[state=active]:border-b-2 data-[state=active]:border-primary"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className={cn(
              "flex items-center gap-2 rounded-lg text-sm font-medium transition-all",
              "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
              "data-[state=active]:border-b-2 data-[state=active]:border-primary"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Users & Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className={cn(
              "flex items-center gap-2 rounded-lg text-sm font-medium transition-all",
              "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
              "data-[state=active]:border-b-2 data-[state=active]:border-primary"
            )}
          >
            <Newspaper className="h-4 w-4" />
            <span>Content Management</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="border rounded-lg p-6 shadow-sm">
          <StatsPage />
        </TabsContent>
        
        <TabsContent value="users" className="rounded-lg shadow-sm">
          <UserManagementTable />
        </TabsContent>
        
        <TabsContent value="content" className="bg-card rounded-lg shadow-sm p-8 border">
          <div className="text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Content Management</h3>
            <p className="text-muted-foreground mb-4">
              Manage and moderate user-generated content, review queued posts, and handle reported content.
            </p>
            <p className="text-sm italic text-muted-foreground">
              This feature is coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}