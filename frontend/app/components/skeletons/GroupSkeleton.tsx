import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

const GroupSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col space-y-4 mx-4 mt-6 rounded">
        <Skeleton className="h-6 w-[20rem]" />
        <div className="flex my-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <Skeleton className="h-6 w-[20rem]" />
        <Skeleton className="h-[7rem] w-[20rem]" />
      </div>
      <Separator className="mt-6" />
      <div className="flex flex-col space-y-4 mx-4 mt-6 rounded">
        <Skeleton className="h-6 w-[20rem]" />
        <div className="flex my-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <Skeleton className="h-6 w-[20rem]" />
        <Skeleton className="h-[7rem] w-[20rem]" />
      </div>
    </div>
  );
};

export default GroupSkeleton;
