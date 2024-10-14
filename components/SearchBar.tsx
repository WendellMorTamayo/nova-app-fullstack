"use client";

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDebounce } from "../lib/useDebounce";
import { FilterButton } from "./FilterSheet";

const Searchbar: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const debouncedValue = useDebounce(search, 500);

  const handleFilterChange = (selectedCategories: string[]) => {
    setFilters(selectedCategories);
  };

  useEffect(() => {
    const query = new URLSearchParams();
    if (debouncedValue) query.set("search", debouncedValue);
    if (filters.length > 0) query.set("categories", filters.join(","));

    const queryString = query.toString();

    router.push(queryString ? `/discover?${queryString}` : "/discover");
  }, [router, debouncedValue, filters]);

  return (
    <div className="relative mt-8 flex items-center space-x-4">
      <div className="relative flex-grow">
        <Input
          className="input-class py-6 pl-12 focus-visible:ring-offset-orange-1 w-full"
          placeholder="I want to listen"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onLoad={() => setSearch("")}
        />
        <Image
          src="/icons/search.svg"
          alt="search"
          height={20}
          width={20}
          className="absolute left-4 top-3.5"
        />
      </div>
      <FilterButton onFilterChange={handleFilterChange} />
    </div>
  );
};

export default Searchbar;
