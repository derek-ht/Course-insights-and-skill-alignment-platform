import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import Modal from "../Modal";
import {
  GroupType,
  getGroupRecruiting,
  inviteUserToGroup,
} from "../../utils/GroupUtils";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { useToast } from "../../components/ui/use-toast";

const InviteToGroupDialogue = ({ id }: { id: string }) => {
  const [toggleModal, setToggleModal] = useState<boolean>(false);
  const [recruitingGroups, setRecruitingGroups] = useState<GroupType[]>([]);
  const { toast } = useToast();

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  const handleInvite = async (gId: string) => {
    inviteUserToGroup(
      gId,
      id,
      async (data) => {
        setToggleModal(false);
      },
      onError
    );
  };

  useEffect(() => {
    if (!toggleModal) {
      getGroupRecruiting(
        id,
        (data) => {
          setRecruitingGroups(data.groups);
        },
        onError
      );
    }
  }, [toggleModal]);

  return (
    <Dialog open={toggleModal} onOpenChange={setToggleModal}>
      <DialogTrigger asChild>
        <Button type="button" onClick={(e) => e.stopPropagation()}>
          Invite to a group
        </Button>
      </DialogTrigger>
      <Modal
        titleChildren="Invite user to a group"
        contentAttr="w-[50rem]"
        contentChildren={
          <ScrollArea className="max-h-[30rem] text-center">
            {recruitingGroups.length > 0 ? (
              <>Choose which group you would like to invite this user to</>
            ) : (
              <>
                <p className="mb-2 font-bold">No groups available.</p>
                <p className="mb-2">
                  Join a group or check you have a non-full group which you have
                  not already invited this user to.
                </p>
              </>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] gap-8 my-4 mx-8">
              {recruitingGroups?.length > 0 &&
                recruitingGroups.map((g) => (
                  <div
                    key={`${g.id}`}
                    className={`rounded-md ${hoverTransition}`}
                    onClick={() => handleInvite(g.id)}
                  >
                    <p className="text-center font-bold">{g.name}</p>
                    <Image
                      width={500}
                      height={500}
                      src={g.coverPhoto}
                      alt={`Group ${g.id} cover photo`}
                    />
                  </div>
                ))}
            </div>
          </ScrollArea>
        }
      />
    </Dialog>
  );
};

const hoverTransition =
  "rounded transition ease-in-out delay-15 box-border hover:shadow-[0_0_1px_8px] hover:shadow-slate-100 cursor-pointer";

export default InviteToGroupDialogue;
