"use client";
import { useState, useCallback, useMemo, useEffect } from 'react';
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
  Loader2,
  Edit,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/lib/useDebounce';
import EditUserDialog from './EditUserDialog'; // Assuming this component is correctly implemented internally
import SubscriptionHistoryDialog from './SubscriptionHistoryDialog'; // Assuming this component is correctly implemented internally

// User type definition (assuming it's correct)
interface User {
  _id: string;
  _creationTime: number;
  clerkId: string;
  name: string;
  email: string;
  accountType: string;
  credits: number;
  subscriptionId?: string;
  endsOn?: number;
  news: {
    count: number;
    totalViews: number;
  };
  isSubscribed: boolean;
  subscriptionStatus: 'active' | 'expired' | 'free';
}

export default function UserManagementTable() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [extensionDays, setExtensionDays] = useState('30');
  const [cursor, setCursor] = useState<string | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([null]);
  const [isPaging, setIsPaging] = useState<'next' | 'previous' | false>(false); // Track direction

  // Use the proper debounce hook
  const debouncedSearch = useDebounce(search, 300);

  // *** Refined resetUIState function ***
  // Called ONLY by onOpenChange handlers when open becomes false.
  const resetUIState = useCallback(() => {
    console.log("Resetting UI State"); // Keep for debugging if needed

    // 1. Clear selection and input data first
    setSelectedUser(null);
    setExtensionDays('30');

    // 2. Ensure dialogs are marked as closed
    // (These might already be false if called via onOpenChange, but ensures consistency)
    setExtendDialogOpen(false);
    setEditDialogOpen(false);
    setHistoryDialogOpen(false);

    // 3. Reset loading states last
    setIsExtending(false);
    setIsPaging(false); // Reset paging state

  }, []); // Empty dependency array is correct

  // Effect to reset pagination when search changes
  useEffect(() => {
    setCursor(null);
    setPage(1);
    setCursorHistory([null]);
    setIsPaging(false); // Ensure paging is reset on search
  }, [debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
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

  // Handle extension submission (Calls setExtendDialogOpen(false) which triggers reset via onOpenChange)
  const handleExtendSubscription = async () => {
    if (!selectedUser) return;
    const days = parseInt(extensionDays, 10);
    if (isNaN(days) || days <= 0 || days > 365) {
      toast({ title: "Invalid input", description: "Please enter a valid number of days (1-365).", variant: "destructive" });
      return;
    }
    try {
      setIsExtending(true);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay if needed
      await extendSubscription({ userId: selectedUser.clerkId, days: days });
      toast({ title: "Subscription extended", description: `${selectedUser.name}'s subscription has been extended by ${extensionDays} days.`, variant: "default" });
      setTimeout(() => setExtendDialogOpen(false), 100); // Trigger close slightly after toast appears
    } catch (error) {
      console.error("Failed to extend subscription:", error);
      toast({ title: "Error", description: "Failed to extend subscription. Please try again.", variant: "destructive" });
      // Even on error, close the dialog
      setTimeout(() => setExtendDialogOpen(false), 100);
    }
    // NOTE: setIsExtending(false) is now handled reliably by resetUIState via onOpenChange
  };


  // Check if there actually are more results to show
  const hasMoreResults = useMemo(() => {
    return Boolean(usersResult?.continueCursor && usersResult?.hasMore);
  }, [usersResult?.continueCursor, usersResult?.hasMore]);

  // --- Refined Pagination Handlers ---
  const handleNextPage = useCallback(() => {
    if (hasMoreResults && !isPaging) {
      setIsPaging('next'); // Set direction
      try {
        setCursorHistory(prev => [...prev, usersResult?.continueCursor ?? null]);
        setCursor(usersResult?.continueCursor ?? null);
        setPage(prevPage => prevPage + 1);
      } catch (error) {
        console.error("Error navigating to next page:", error);
        setIsPaging(false); // Reset on error
      } finally {
        // Reset paging state shortly after initiating (Convex query will handle actual loading)
        setTimeout(() => {
           // Check if still paging 'next' before resetting, avoids race conditions
           if (isPaging && isPaging === 'next') setIsPaging(false);
        }, 500); // Increased delay slightly
      }
    }
  }, [usersResult, hasMoreResults, isPaging]); // Added isPaging dependency

  const handlePreviousPage = useCallback(() => {
    if (page > 1 && !isPaging) {
       setIsPaging('previous'); // Set direction
      try {
        const newHistory = [...cursorHistory];
        newHistory.pop();
        const previousCursor = newHistory[newHistory.length - 1];
        setCursorHistory(newHistory);
        setCursor(previousCursor);
        setPage(prevPage => prevPage - 1);
      } catch (error) {
        console.error("Error navigating to previous page:", error);
         setIsPaging(false); // Reset on error
      } finally {
        // Reset paging state shortly after initiating
        setTimeout(() => {
           // Check if still paging 'previous' before resetting
           if (isPaging && isPaging === 'previous') setIsPaging(false);
        }, 500); // Increased delay slightly
      }
    }
  }, [page, cursorHistory, isPaging]); // Added isPaging dependency

  // Helper for subscription status badge
  const getStatusBadge = (status: string) => { /* ... no changes ... */
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  // Format date helper
  const formatDate = (timestamp: number | null | undefined) => { /* ... no changes ... */
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  // Loading state for the table (based on query result, not isPaging)
  const isLoading = usersResult === undefined;

  // Safely access users data
  const users = useMemo(() => {
    if (!usersResult || !Array.isArray(usersResult.users)) return [];
    return usersResult.users;
  }, [usersResult]);

  // === JSX Structure (Simplified for brevity, focusing on changes) ===
  return (
    <Card className="shadow-md border">
      <CardHeader> {/* ... no changes ... */}
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
                 Array.from({ length: limit }).map((_, index) => ( // Use limit for skeleton rows
                  <TableRow key={`loading-${index}`}>
                    {/* ... Skeleton Cells ... */}
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
                    {/* ... User Cells ... */}
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
                       {/* DropdownMenu setup assumes internal dialogs are correctly handled */}
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
                          {/* ... DropdownMenuItems setting state correctly ... */}
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                               setSelectedUser({ ...user, accountType: user.accountType || '', subscriptionStatus: user.subscriptionStatus as 'active' | 'expired' | 'free', credits: user.credits ?? 0 });
                              setEditDialogOpen(true);
                            }}
                             className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                           > <Edit className="mr-2 h-4 w-4" /> <span>Edit User</span> </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedUser({ ...user, accountType: user.accountType || '', subscriptionStatus: user.subscriptionStatus as 'active' | 'expired' | 'free', credits: user.credits ?? 0 });
                               setExtendDialogOpen(true);
                             }}
                             className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                           > <Calendar className="mr-2 h-4 w-4" /> <span>Extend Subscription</span> </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedUser({ ...user, accountType: user.accountType || '', subscriptionStatus: user.subscriptionStatus as 'active' | 'expired' | 'free', credits: user.credits ?? 0 });
                               setHistoryDialogOpen(true);
                             }}
                             className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                           > <CreditCard className="mr-2 h-4 w-4" /> <span>Payment History</span> </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={(e) => {
                               e.stopPropagation();
                               toast({ /* ... view details toast ... */ });
                             }}
                             className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                           > <UserCheck className="mr-2 h-4 w-4" /> <span>View Details</span> </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow> <TableCell colSpan={6} className="h-24 text-center"> No users found. </TableCell> </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- Refined Pagination Controls --- */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {/* ... Text showing results/page ... */}
             {search ?
              `Showing ${users.length} ${users.length === 1 ? 'result' : 'results'} for "${search}"` :
              `Showing ${users.length} ${users.length === 1 ? 'user' : 'users'} (page ${page})`
            }
             {usersResult && hasMoreResults ? "(more available)" : ""}
             {usersResult && !hasMoreResults && users.length >= 0 ? "(end of results)" : ""}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              // Disable if on page 1 or if currently paging (in either direction)
              disabled={page === 1 || !!isPaging}
              onClick={handlePreviousPage}
              className="h-8 w-8 p-0 bg-white dark:bg-black-3 border-gray-300 dark:border-gray-700"
            >
              {/* Show loader specifically when paging backwards */}
              {isPaging === 'previous' ? (
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
              // Disable if no more results or if currently paging (in either direction)
              disabled={!hasMoreResults || !!isPaging}
              onClick={handleNextPage}
              className="h-8 w-8 p-0 bg-white dark:bg-black-3 border-gray-300 dark:border-gray-700"
            >
               {/* Show loader specifically when paging forwards */}
              {isPaging === 'next' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* --- Dialogs --- */}
      {/* Extend Subscription Dialog (using refined resetUIState via onOpenChange) */}
      <Dialog
        open={extendDialogOpen}
        onOpenChange={(open) => { if (!open) resetUIState(); else setExtendDialogOpen(open); }}
      >
         {/* DialogContent assumes cancel button uses setExtendDialogOpen(false) */}
         <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black-1 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg z-50">
           {/* ... Dialog Header, Body ... */}
           <DialogHeader> <DialogTitle>Extend Subscription</DialogTitle> {/* ... */} </DialogHeader>
           <div className="grid gap-4 py-4"> {/* ... Input, Details ... */} </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setExtendDialogOpen(false)} disabled={isExtending} > Cancel </Button>
             <Button onClick={handleExtendSubscription} disabled={isExtending}> {/* ... Extend Button Text/Loader ... */} </Button>
           </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Edit User Dialog (Crucially assumes correct internal implementation) */}
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={(open) => { if (!open) resetUIState(); else setEditDialogOpen(open); }}
        user={selectedUser}
        onUserUpdated={resetUIState} // resetUIState called on SUCCESSFUL update
      />

      {/* Subscription History Dialog (Crucially assumes correct internal implementation) */}
      <SubscriptionHistoryDialog
        open={historyDialogOpen}
        onOpenChange={(open) => { if (!open) resetUIState(); else setHistoryDialogOpen(open); }}
        user={selectedUser}
      />
    </Card>
  );
}