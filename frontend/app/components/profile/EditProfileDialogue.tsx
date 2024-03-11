"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { PenSquare } from "lucide-react";
import Modal from "../Modal";
import EditProfileForm from "./EditProfileForm";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import EditPasswordForm from "./EditPasswordForm";
import { UserProps } from "../types";
import { useToast } from "../ui/use-toast";

const EditProfileDialogue = ({
  user,
  onUpdate,
}: {
  user: UserProps;
  editButton?: React.ReactElement;
  onUpdate: () => void;
}) => {
  const { toast } = useToast();
  const [toggleEditModal, setToggleEditModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Update user data when closing the dialogue
    if (!toggleEditModal) {
      onUpdate();
      if (saveSuccess) {
        toast({
          title: "Changes saved",
          description: `Saved changes to profile`,
        });
        setSaveSuccess(false);
      }
    }
  }, [toggleEditModal, saveSuccess]);

  return (
    <Dialog open={toggleEditModal} onOpenChange={setToggleEditModal}>
      <DialogTrigger asChild>
        <PenSquare className="hover:text-slate-400" />
      </DialogTrigger>
      <Modal
        titleChildren={<>Edit Profile</>}
        contentAttr="sm:max-w-[40rem] lg:h-[40rem]"
        contentChildren={
          <Tabs defaultValue="profile">
            <TabsList className="w-full transparent grid grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent
              value="profile"
              className="h-[32rem] focus-visible:ring-0"
            >
              <ScrollArea className="h-full">
                <div className="">
                  <EditProfileForm user={user} setSaved={setSaveSuccess}/>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent
              value="password"
              className="h-[32rem] focus-visible:ring-0"
            >
              <div className="h-full">
                <EditPasswordForm />
              </div>
            </TabsContent>
          </Tabs>
        }
      />
    </Dialog>
  );
};

export default EditProfileDialogue;
