import TabContentSkeleton from "@/components/TabContentSkeleton";

export default function RecentLoading() {
  return (
      <div className="relative mt-4">
        <TabContentSkeleton itemCount={9} />
      </div>
    );
}