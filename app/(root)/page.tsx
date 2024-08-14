"use client";
import LoaderSpinner from "@/components/LoaderSpinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/trending");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderSpinner />
    </div>
  );
};

export default Home;
