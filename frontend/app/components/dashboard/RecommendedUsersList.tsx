import React, { useEffect, useState } from "react";
import { UserProps } from "../types";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import RecommendedUserCard from "./RecommendedUserCard";
import UserScrollAreaSkeleton from "../skeletons/UserScrollAreaSkeleton";

const RecommendedUsersList = ({
  users,
  footer,
  isLoading,
}: {
  users: UserProps[];
  footer?: (id: string) => React.ReactElement | any;
  isLoading?: boolean;
}) => {
  const [usersData, setUsersData] = useState<UserProps[]>([]);

  useEffect(() => {
    setUsersData(users);
  }, [users]);

  return (
    <>
      {isLoading ? (
        <UserScrollAreaSkeleton />
      ) : (
        <ScrollArea className="w-full h-[22.5rem] sm:h-fit">
          <div className="grid-cols-1 mb-6 w-full md:flex md:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            {usersData.map((user) => (
              <RecommendedUserCard key={user.id} user={user} footer={footer} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </>
  );
};

export default RecommendedUsersList;
