"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any; // User data from Convex
  onUserUpdated: () => void;
}

export default function EditUserDialog({ 
  open, 
  onOpenChange, 
  user,
  onUserUpdated 
}: EditUserDialogProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [userName, setUserName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [credits, setCredits] = useState("0");
  
  // Update user mutation
  const updateUserDetails = useMutation(api.admin.updateUserDetails);
  
  // Initialize form with user data when it changes
  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      setAccountType(user.accountType || "basic");
      setCredits(String(user.credits || 0));
    }
  }, [user]);
  
  const handleUpdateUser = async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Validate inputs
      const creditsValue = parseInt(credits, 10);
      if (isNaN(creditsValue) || creditsValue < 0) {
        toast({
          title: "Invalid credits",
          description: "Credits must be a positive number",
          variant: "destructive"
        });
        setIsUpdating(false);
        return;
      }
      
      // Call the mutation to update user details
      await updateUserDetails({
        userId: user.clerkId,
        name: userName,
        accountType: accountType,
        credits: creditsValue
      });
      
      // Show success message
      toast({
        title: "User updated",
        description: `${userName}'s details have been updated successfully.`,
        variant: "default"
      });
      
      // Close dialog and refresh data
      onOpenChange(false);
      onUserUpdated();
      
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-black-1 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg z-50">
        <DialogHeader>
          <DialogTitle className="text-black dark:text-white flex items-center gap-2">
            Edit User Details
            {user.accountType && (
              <Badge className={
                user.accountType === "admin" 
                  ? "bg-purple-600" 
                  : user.accountType === "premium" 
                    ? "bg-green-600" 
                    : "bg-gray-600"
              }>
                {user.accountType}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update {user.name}&apos;s account information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user-email" className="text-black dark:text-white">Email</Label>
            <Input
              id="user-email"
              value={user.email || ""}
              className="bg-gray-100 dark:bg-black-3 text-gray-500 dark:text-gray-400"
              disabled
            />
            <p className="text-xs text-gray-500">Email cannot be changed (managed by Clerk)</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="user-name" className="text-black dark:text-white">Name</Label>
            <Input
              id="user-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-white dark:bg-black-3 text-black dark:text-white border border-gray-300 dark:border-gray-700"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="account-type" className="text-black dark:text-white">Account Type</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger 
                id="account-type"
                className="bg-white dark:bg-black-3 text-black dark:text-white border border-gray-300 dark:border-gray-700"
              >
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-black-2 border border-gray-200 dark:border-gray-800">
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="credits" className="text-black dark:text-white">Credits</Label>
            <Input
              id="credits"
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              min="0"
              className="bg-white dark:bg-black-3 text-black dark:text-white border border-gray-300 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500">Available credits for premium features</p>
          </div>
          
          <div className="grid gap-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-black dark:text-white">User ID:</span>
              <span className="text-gray-600 dark:text-gray-400 font-mono text-xs break-all">{user.clerkId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black dark:text-white">Joined:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(user._creationTime).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isUpdating}
            className="bg-white dark:bg-black-3 text-black dark:text-white border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-black-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateUser} 
            disabled={isUpdating}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}