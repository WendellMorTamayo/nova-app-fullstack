"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';

export default function CreateUserButton() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const createUser = useMutation(api.users.manualCreateUser);

  const handleCreateUser = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to create a user record",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createUser({
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || undefined
      });

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateUser}
      disabled={isCreating || !user}
      className="bg-purple-600 text-white hover:bg-purple-700"
    >
      {isCreating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Fix User Registration"
      )}
    </Button>
  );
}