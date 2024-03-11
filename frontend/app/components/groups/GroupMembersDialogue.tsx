import React, { useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import Modal from "../Modal";
import { GroupMemberType, GroupType } from "../../utils/GroupUtils";
import { ScrollArea } from "../ui/scroll-area";
import GroupMemberAvatar from "./GroupMemberAvatar";

const GroupMembersDialogue = ({ group }: { group: GroupType }) => {
  const [toggleCreateModal, setToggleCreateModal] = useState<boolean>(false);
  return (
    <Dialog open={toggleCreateModal} onOpenChange={setToggleCreateModal}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full">
          More Members
        </Button>
      </DialogTrigger>
      <Modal
        titleChildren={`Members of ${group.name}`}
        contentChildren={
          <ScrollArea className="max-h-[30rem]">
            {group.members.map((m: GroupMemberType) => (
              <GroupMemberAvatar member={m} key={m.id} />
            ))}
          </ScrollArea>
        }
      />
    </Dialog>
  );
};

export default GroupMembersDialogue;
