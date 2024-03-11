"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import EditProfileDialogue from "../profile/EditProfileDialogue";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { UserProps } from "../types";
import ShareProfileDialog from "./ShareProfileDialog";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  fetchUserData,
  formatUserType,
  userToggleVisibility,
} from "@/app/utils/UserUtils";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";

const ProfileDetails = ({
  user,
  isAuthUser,
  onUpdate,
}: {
  user: UserProps;
  isAuthUser: boolean;
  onUpdate: () => void;
}) => {
  const { toast } = useToast();
  const [publicToggled, setPublicToggled] = useState(user.public);

  useEffect(() => {
    fetchUserData(
      (user) => setPublicToggled(user.public),
      (error: any) => {
        toast({
          variant: "destructive",
          title: "Fetch User Error",
          description: error,
        });
      }
    );
  }, []);

  const toggleVisibility = async () => {
    const fail = (error: string) => {
      toast({
        variant: "destructive",
        title: "Toggle Visibility Error",
        description: error,
      });
    };

    const success = () => {
      setPublicToggled(!publicToggled);
    };
    userToggleVisibility(success, fail);
  };

  return (
    <div className="w-full">
      <Card className="flex flex-col p-5 lg:flex-row lg:justify-between">
        <div className="flex flex-col items-center md:flex-row md:w-full">
          <div className="flex justify-center items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user.avatar || "/assets/defaultAvatar.jpg"} />
              <AvatarFallback>Profile picture</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-grow">
            <div className="flex justify-center flex-col ml-5 gap-1.5 text-sm">
              <CardHeader className="pl-0">
                <CardTitle className="font-bold">
                  {user.firstName} {user.lastName}
                </CardTitle>
              </CardHeader>
              {user.type && (
                <Badge className="w-fit">{formatUserType(user.type)}</Badge>
              )}
              <p>{user.school}</p>
              <p>{user.degree}</p>
            </div>
            {isAuthUser && (
              <div className="flex flex-col flex-grow justify-center items-end">
                <EditProfileDialogue user={user} onUpdate={onUpdate} />
                <ShareProfileDialog isPublic={publicToggled} />
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="visibility"
                    checked={!publicToggled}
                    onCheckedChange={toggleVisibility}
                  />
                  <Label htmlFor="visibility">
                    {publicToggled ? "Public" : "Private"}
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      <Card className="mt-7">
        <CardHeader>
          <CardTitle className="font-bold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-3">{user.email}</p>
          <p className="mt-3">{user.phoneNumber}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDetails;
