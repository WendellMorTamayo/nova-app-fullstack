"use client";

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Calendar, 
  Search,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function UserManagementTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extensionDays, setExtensionDays] = useState('30');
  const [cursor, setCursor] = useState<string | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([null]);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    // Reset to first page when searching
    if (value !== debouncedSearch) {
      setCursor(null);
      setPage(1);
      setCursorHistory([null]);
      
      // Debounce search
      clearTimeout((window as any).searchTimeout);
      (window as any).searchTimeout = setTimeout(() => {
        setDebouncedSearch(value);
      }, 300);
    }
  };
  
  // Fetch users with pagination
  const usersResult = useQuery(api.admin.getUsers, { 
    filter: debouncedSearch !== '' ? debouncedSearch : undefined,
    paginationOpts: {
      cursor: cursor ?? undefined,
      numItems: limit
    }
  });
  
  // Get subscription details for the selected user
  const subscriptionDetails = useQuery(
    api.admin.getUserSubscription, 
    selectedUser ? { userId: selectedUser.clerkId } : "skip"
  );
  
  // Mutation to extend subscription
  const extendSubscription = useMutation(api.admin.extendSubscription);
  
  // Handle extension submission
  const handleExtendSubscription = async () => {
    if (!selectedUser) return;
    
    // Validate input
    const days = parseInt(extensionDays, 10);
    if (isNaN(days) || days <= 0 || days > 365) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number of days (1-365).",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsExtending(true);
      
      // Add a small delay to prevent quick clicks
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await extendSubscription({
        userId: selectedUser.clerkId,
        days: days
      });
      
      // Show success toast
      toast({
        title: "Subscription extended",
        description: `${selectedUser.name}'s subscription has been extended by ${extensionDays} days.`,
        variant: "default",
      });
      
      // Reset state after a slight delay to allow animation to complete
      setTimeout(() => {
        setExtensionDays("30");
        resetUIState();
      }, 300);
      
    } catch (error) {
      console.error("Failed to extend subscription:", error);
      toast({
        title: "Error",
        description: "Failed to extend subscription. Please try again.",
        variant: "destructive",
      });
      
      // Reset UI state with a slight delay to allow toasts to show
      setTimeout(() => {
        resetUIState();
      }, 300);
    }
  };
  
  // Handle pagination with debounce to prevent rapid clicking
  const [isPaging, setIsPaging] = useState(false);
  
  // Reset all UI state function
  const resetUIState = useCallback(() => {
    setIsPaging(false);
    setIsExtending(false);
    setExtendDialogOpen(false);
  }, []);
  
  // Check if there actually are more results to show
  const hasMoreResults = useMemo(() => {
    return Boolean(usersResult?.continueCursor && usersResult?.hasMore);
  }, [usersResult?.continueCursor, usersResult?.hasMore]);
  
  const handleNextPage = useCallback(() => {
    if (hasMoreResults && !isPaging) {
      setIsPaging(true);
      
      try {
        // Store current cursor in history before moving to next page
        setCursorHistory(prev => [...prev, usersResult?.continueCursor ?? null]);
        setCursor(usersResult?.continueCursor ?? null);
        setPage(page + 1);
      } catch (error) {
        console.error("Error navigating to next page:", error);
      } finally {
        // Reset paging state after a short delay
        setTimeout(() => {
          setIsPaging(false);
        }, 300);
      }
    }
  }, [usersResult, hasMoreResults, page, isPaging]);
  
  const handlePreviousPage = useCallback(() => {
    if (page > 1 && !isPaging) {
      setIsPaging(true);
      
      try {
        // Get the previous cursor from history
        const newHistory = [...cursorHistory];
        newHistory.pop(); // Remove current cursor
        const previousCursor = newHistory[newHistory.length - 1];
        
        setCursorHistory(newHistory);
        setCursor(previousCursor);
        setPage(page - 1);
      } catch (error) {
        console.error("Error navigating to previous page:", error);
      } finally {
        // Reset paging state after a short delay
        setTimeout(() => {
          setIsPaging(false);
        }, 300);
      }
    }
  }, [page, cursorHistory, isPaging]);
  
  // Helper for subscription status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };
  
  // Format date helper
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  // Loading state for the table
  const isLoading = usersResult === undefined;
  
  // Safely access users data, with fallback for unexpected data shapes
  const users = useMemo(() => {
    if (!usersResult || !Array.isArray(usersResult.users)) return [];
    return usersResult.users;
  }, [usersResult]);

  return (
    <Card className="shadow-md border">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and their subscriptions</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8 w-full md:w-[250px]"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Content Count</TableHead>
                <TableHead>Subscription Ends</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{user.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.subscriptionStatus)}
                    </TableCell>
                    <TableCell>{formatDate(user._creationTime)}</TableCell>
                    <TableCell>{user.news.count}</TableCell>
                    <TableCell>
                      {user.endsOn ? formatDate(user.endsOn) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-full flex items-center justify-center"
                            aria-label="Open user actions menu"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50 bg-white dark:bg-black-2 border border-gray-200 dark:border-gray-800 shadow-lg rounded-md">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event from bubbling up
                              setSelectedUser(user);
                              setExtendDialogOpen(true);
                            }}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Extend Subscription</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event from bubbling up
                              // View user details - could open a dialog or navigate to profile
                              setSelectedUser(user);
                              
                              // Show a toast with user details as a temporary solution
                              toast({
                                title: "User Details",
                                description: (
                                  <div className="space-y-1 text-sm mt-2">
                                    <p><b>Name:</b> {user.name}</p>
                                    <p><b>Email:</b> {user.email}</p>
                                    <p><b>Content:</b> {user.news.count} items</p>
                                    <p><b>Status:</b> {user.subscriptionStatus}</p>
                                    <p><b>Joined:</b> {formatDate(user._creationTime)}</p>
                                  </div>
                                ),
                                variant: "default",
                              });
                            }}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {users.length} users {hasMoreResults ? "(more available)" : "(end of results)"}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1 || isPaging}
              onClick={handlePreviousPage}
              className="h-8 w-8 p-0 bg-white dark:bg-black-3 border-gray-300 dark:border-gray-700"
            >
              {isPaging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="text-sm font-medium px-2">Page {page}</span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={!hasMoreResults || isPaging}
              onClick={handleNextPage}
              className="h-8 w-8 p-0 bg-white dark:bg-black-3 border-gray-300 dark:border-gray-700"
            >
              {isPaging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Extend Subscription Dialog */}
      <Dialog 
        open={extendDialogOpen} 
        onOpenChange={(open) => {
          // When dialog is closed externally (e.g., by clicking outside)
          if (!open) {
            // Reset all UI state to prevent things getting stuck
            resetUIState();
          } else {
            setExtendDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black-1 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg z-50">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Extend Subscription</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Extend the subscription period for {selectedUser?.name || 'this user'}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="days" className="text-black dark:text-white">Extension Period (days)</Label>
              <Input
                id="days"
                type="number"
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
                min="1"
                max="365"
                className="bg-white dark:bg-black-3 text-black dark:text-white border border-gray-300 dark:border-gray-700"
              />
            </div>
            {selectedUser && (
              <div className="text-sm space-y-2 border border-gray-200 dark:border-gray-800 rounded-md p-3 bg-gray-50 dark:bg-black-3">
                <p className="text-black dark:text-white"><strong>Current Status:</strong> {selectedUser.subscriptionStatus}</p>
                {subscriptionDetails ? (
                  <>
                    <p className="text-black dark:text-white"><strong>Current End Date:</strong> {formatDate(selectedUser.endsOn)}</p>
                    <p className="text-black dark:text-white"><strong>Days Remaining:</strong> {subscriptionDetails.daysRemaining || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      New end date will be: {
                        formatDate(
                          selectedUser.endsOn 
                            ? selectedUser.endsOn + (parseInt(extensionDays, 10) * 24 * 60 * 60 * 1000)
                            : Date.now() + (parseInt(extensionDays, 10) * 24 * 60 * 60 * 1000)
                        )
                      }
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading subscription details...</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={resetUIState} 
              disabled={isExtending}
              className="bg-white dark:bg-black-3 text-black dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-black-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExtendSubscription} 
              disabled={isExtending}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {isExtending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extending...
                </>
              ) : (
                "Extend Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}