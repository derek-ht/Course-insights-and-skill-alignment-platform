"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Trash2 as DeleteIcon } from "lucide-react";
import { Button } from "../ui/button";
import { deleteUser } from "../../utils/AdminUtils";
import { useRouter } from "next/navigation";
import { userDataType } from "../../utils/UserUtils";
import { useToast } from "../ui/use-toast";

const buttonIconStyle = "w-4 h-auto hover:text-slate-400";

const DeleteUserDialogue = ({
  user,
  update,
}: {
  user: userDataType;
  update: CallableFunction;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [openDialogue, setOpenDialogue] = useState(false);
  const onDelete = () => {
    const onSuccess = () => {
      const userId = localStorage.getItem("uID");
      if (userId == user.id) {
        router.push("/");
      } else {
        setOpenDialogue(false);
        update();
      }
    };
    const onError = (msg: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      });
      setOpenDialogue(false);
    };
    deleteUser(user.id, onSuccess, onError);
  };
  return (
    <Dialog open={openDialogue} onOpenChange={setOpenDialogue}>
      <DialogTrigger asChild>
        <DeleteIcon
          className={buttonIconStyle}
          onClick={() => setOpenDialogue(true)}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user{" "}
            <b>
              {user.firstName} {user.lastName}?
            </b>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-0 gap-4 md:gap-0">
          <Button variant="outline" onClick={() => setOpenDialogue(false)}>
            Cancel
          </Button>
          <Button onClick={onDelete}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialogue;
