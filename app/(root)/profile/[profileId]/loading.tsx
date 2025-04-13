'use client';

import ProfileSkeleton from "@/components/ProfileSkeleton";

export default function ProfileLoading() {
  return (
    <div className="relative mt-4">
      <ProfileSkeleton />
    </div>
  );
}