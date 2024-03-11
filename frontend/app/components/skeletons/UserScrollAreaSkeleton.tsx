import React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import UserSkeleton from "./UserSkeleton";

const UserScrollAreaSkeleton = () => {
  return (
    <ScrollArea className="w-full h-[22.5rem] sm:h-fit">
      <div className="grid-cols-1 mb-6 w-full md:flex md:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
        <UserSkeleton />
        <UserSkeleton />
        <UserSkeleton />
        <UserSkeleton />
        <UserSkeleton />
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default UserScrollAreaSkeleton;
