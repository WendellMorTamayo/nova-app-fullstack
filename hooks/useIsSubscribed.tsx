import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

export function useIsSubscribed() {
  const user = useQuery(api.users.getUser);
  
  // Handle all possible edge cases
  if (!user) return false;
  if (user.endsOn === undefined || user.endsOn === null) return false;
  
  return user.endsOn > Date.now();
}
