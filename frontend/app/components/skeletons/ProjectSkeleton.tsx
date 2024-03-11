import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

const ProjectSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col space-y-4 items-center mx-4 mt-4 rounded">
        <Skeleton className="h-10 w-[20rem]" />
        <Skeleton className="h-[11rem] w-[20rem]" />
      </div>
      <Separator className="mt-6" />
      <div className="flex flex-col space-y-4 items-center mx-4 mt-4 rounded">
        <Skeleton className="h-10 w-[20rem]" />
        <Skeleton className="h-[11rem] w-[20rem]" />
      </div>
    </div>
  );
};

export default ProjectSkeleton;
