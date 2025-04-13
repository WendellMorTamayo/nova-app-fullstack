import { EmptyStateProps } from "@/types";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

const EmptyState = ({
  title,
  search,
  buttonLink,
  buttonText,
  description,
}: EmptyStateProps) => {
  return (
    <section className="flex-center size-full flex-col gap-3">
      <Image src="/emptyState.svg" alt="emptyState" width={240} height={240} />
      <div className="flex-center w-full max-w-[300px] flex-col gap-3">
        <h1 className="text-18 text-center font-medium text-white-1">
          {title}
        </h1>
        {search && (
          <p className="text-16 text-cent font-medium text-white-2">
            Try adjusting you&apos;re search to find what you&apos;re looking
            for
          </p>
        )}
        {description && (
          <p className="text-16 text-center font-medium text-white-2">
            {description}
          </p>
        )}
        {buttonLink && (
          <Button className="bg-purple-1">
            <Link href={buttonLink} className="gap-1 flex">
              <Image
                src="/discover.svg"
                width={20}
                height={20}
                alt="discover"
              />
              <h1 className="text-16 font-extrabold text-white-1">
                {buttonText}
              </h1>
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
};

export default EmptyState;
