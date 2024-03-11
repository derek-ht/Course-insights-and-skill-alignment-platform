"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Pencil } from "lucide-react";
import Modal from "../Modal";
import AdminEditForm from "./AdminEditForm";
import { ScrollArea } from "../ui/scroll-area";
import { userDataType } from "../../utils/UserUtils";
import { useToast } from "../ui/use-toast";

const AdminEditDialogue = ({
  user,
  onUpdate,
  isAuthUser,
}: {
  user: userDataType;
  isAuthUser: boolean;
  onUpdate: () => void;
}) => {
  const [toggleEditModal, setToggleEditModal] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const { toast } = useToast();
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else {
      // Update user data when closing the dialogue
      if (!toggleEditModal) {
        onUpdate();
        if (saveSuccess) {
          toast({
            title: "Changes saved",
            description: `Saved changes to user`,
          });
          setSaveSuccess(false);
        }
      }
    }
  }, [toggleEditModal, saveSuccess]);

  return (
    <Dialog open={toggleEditModal} onOpenChange={setToggleEditModal}>
      <DialogTrigger asChild>
        {isAuthUser && (
          <Pencil
            className="hover:text-slate-400 w-4 h-4"
            onClick={(e) => (e.bubbles = false)}
          />
        )}
      </DialogTrigger>
      <Modal
        titleChildren={<>Edit Profile</>}
        contentAttr="px-2 pt-4 sm:max-w-[40rem] md:p-6 lg:h-[42rem]"
        contentChildren={
          <ScrollArea className="h-[32rem] md:h-[36rem]">
            <div className="mx-10">
              <AdminEditForm user={user} setSaved={setSaveSuccess}/>
            </div>
          </ScrollArea>
        }
      />
    </Dialog>
  );
};

export default AdminEditDialogue;
