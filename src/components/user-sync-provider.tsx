"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

/**
 * Component to automatically sync user data when they sign in
 * Place this in your layout or app component
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const [hasSynced, setHasSynced] = useState<string | null>(null);
  
  const syncUserMutation = api.user.syncUser.useMutation({
    // CRITICAL: Disable retries to prevent infinite loops
    retry: false,
    onSuccess: (data) => {
      if (data?.created) {
        console.log("✅ New user created in database:", data.user);
      } else {
        console.log("✅ Existing user updated in database:", data?.user);
      }
      setHasSynced(userId || null);
    },
    onError: (error) => {
      console.error("❌ Failed to sync user:", error.message);
      // CRITICAL: Still set as synced to prevent retries
      setHasSynced(userId || null);
    },
  });

  // Sync user data when they sign in (only once per session)
  useEffect(() => {
    if (isSignedIn && userId && hasSynced !== userId && !syncUserMutation.isPending) {
      console.log("🔄 Attempting to sync user:", userId);
      syncUserMutation.mutate();
    }
  }, [isSignedIn, userId, hasSynced]); // REMOVED syncUserMutation from deps to prevent recreation

  // Reset sync status when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      setHasSynced(null);
    }
  }, [isSignedIn]);

  return <>{children}</>;
}