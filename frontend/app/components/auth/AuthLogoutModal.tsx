"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { userLogOut } from "../../utils/AuthUtils";
import { useRouter } from "next/navigation";
import { useAccessControlContext } from "../../context/accessControl";
import { useToast } from "../ui/use-toast";
import Modal from "../Modal";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogTrigger } from "../ui/dialog";

export default function AuthLogOutModal({ trigger }: React.ReactElement | any) {
  const router = useRouter();
  const { toast } = useToast();
  const { setRole } = useAccessControlContext();
  const [toggleShareModal, setToggleShareModal] = useState(false);

  return (
    <Dialog open={toggleShareModal} onOpenChange={setToggleShareModal}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <Modal
        titleChildren="Confirm logout"
        descriptionChildren="Are you sure you want to log out?"
        footerChildren={
          <>
            <Button
              variant={"secondary"}
              onClick={() => setToggleShareModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                userLogOut(
                  () => {
                    setRole("");
                    localStorage.clear();
                    router.push("/");
                  },
                  (error) => {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: error,
                    });
                    setRole("");
                    localStorage.clear();
                    router.push("/");
                  }
                )
              }
            >
              Confirm
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
