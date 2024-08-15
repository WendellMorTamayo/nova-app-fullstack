import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";


export function useIsSubscribed() {
  const user = useQuery(api.users.getUser);
  return user && (user.endsOn ?? 0) > Date.now();
}
