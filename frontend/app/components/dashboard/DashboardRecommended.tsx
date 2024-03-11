"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { getRecommendedUsers } from "@/app/utils/RecommenderUtils";
import { useToast } from "../ui/use-toast";
import { UserProps } from "../types";
import RecommendedUsersList from "./RecommendedUsersList";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import UserSkeleton from "../skeletons/UserSkeleton";
import InviteToGroupDialogue from "./InviteToGroupDialogue";
import UserScrollAreaSkeleton from "../skeletons/UserScrollAreaSkeleton";

const DashboardRecommended = () => {
  const { toast } = useToast();
  const [recommendedUsers, setRecommendedUsers] = useState<UserProps[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  useEffect(() => {
    getRecommendedUsers((data) => {
      setRecommendedUsers(data.users);
      setUsersLoading(false);
    }, onError);
  }, []);

  return (
    <Card className="mt-7 mb-12 w-full">
      <CardHeader>
        <CardTitle>Recommended Users</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {usersLoading ? (
          <UserScrollAreaSkeleton />
        ) : (
          <RecommendedUsersList
            users={recommendedUsers}
            footer={(id) => (
              <div onClick={(e) => e.stopPropagation()}>
                <InviteToGroupDialogue id={id} />
              </div>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardRecommended;
