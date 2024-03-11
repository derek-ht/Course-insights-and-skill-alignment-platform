import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";

const UserSkeleton = () => {
  return (
    <Card className="overflow-hidden rounded w-full md:w-[13.7rem]">
      <CardContent className="flex flex-col items-center w-full h-full pt-6 pb-3">
        <Skeleton className="w-[4.5rem] h-[4.5rem] rounded-full mb-3" />
        <div className="flex flex-col items-center space-y-2">
          <Skeleton className="h-4 w-[9rem]" />
          <Skeleton className="h-4 w-[11rem]" />
          <Skeleton className="h-4 w-[5rem]" />
          <Skeleton className="h-4 w-[5rem]" />
          <Skeleton className="h-4 w-[5rem]" />
          <Skeleton className="h-4 w-[5rem]" />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSkeleton;
