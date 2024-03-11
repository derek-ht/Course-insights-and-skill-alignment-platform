import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import GroupCreateForm from "./GroupCreateForm";
import { Button } from "../ui/button";

const GroupCreateDialogue = ({ onUpdate }: { onUpdate: () => void }) => {
  const [toggleCreateModal, setToggleCreateModal] = useState<boolean>(false);
  const toggleModal = () => {
    setToggleCreateModal(false);
    onUpdate();
  };
  return (
    <Dialog open={toggleCreateModal} onOpenChange={setToggleCreateModal}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-[35rem] md:w-auto">Create Group</Button>
      </DialogTrigger>
      <DialogContent className="px-2 md:px-6">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>Create a new group</DialogDescription>
        </DialogHeader>
        <div className="mx-2 lg:mx-7">
          <GroupCreateForm onUpdate={toggleModal} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreateDialogue;
