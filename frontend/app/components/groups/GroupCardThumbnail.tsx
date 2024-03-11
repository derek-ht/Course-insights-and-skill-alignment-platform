import React, { useEffect, useState } from "react";
import CardThumbnail from "../CardThumbnail";
import {
  GroupType,
  deleteGroup,
  leaveGroup,
  userIsMember,
} from "../../utils/GroupUtils";
import { useRouter } from "next/navigation";
import GroupEditDialogue from "./GroupEditDialogue";
import { Button } from "../ui/button";
import { joinGroup } from "../../utils/GroupUtils";
import { useToast } from "../ui/use-toast";
import ActionDialogue from "../ActionDialogue";
import {
  acceptInvite,
  cancelRequest,
  rejectInvite,
  requestGroup,
} from "@/app/utils/UserUtils";

const GroupCardThumbnail = ({
  group,
  onUpdate,
  allowEdit,
  role,
  isPending,
}: {
  group: GroupType;
  onUpdate: () => void;
  allowEdit?: boolean;
  role: string;
  isPending?: string;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isMember, setIsMember] = useState(false);

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  const handleDelete = () => {
    deleteGroup(group.id, (res: any) => onUpdate(), onError);
  };

  useEffect(() => {
    const uId = localStorage.getItem("uID");
    if (uId == null) return;
    setIsMember(userIsMember(uId, group));
  }, []);

  const handleRequest = () => {
    requestGroup(
      group.id,
      () => {
        onUpdate();
      },
      onError
    );
  };

  const handleCancelRequest = () => {
    cancelRequest(
      group.id,
      () => {
        onUpdate();
      },
      onError
    );
  };

  const handleRejectInvite = () => {
    rejectInvite(
      group.id,
      () => {
        onUpdate();
      },
      onError
    );
  };

  const handleAcceptInvite = () => {
    acceptInvite(
      group.id,
      () => {
        onUpdate();
      },
      onError
    );
  };

  const handleLeave = () => {
    leaveGroup(
      group.id,
      () => {
        onUpdate();
        setIsMember(false);
      },
      onError
    );
  };

  return (
    <CardThumbnail
      imgSrc={group.coverPhoto}
      imgAttr="h-[15rem] w-full object-cover"
      imgAlt={`Group ${group.name} cover`}
      onClick={(e) =>
        allowEdit &&
        (isMember || (role && role !== "STUDENT")) &&
        router.push(`/groups/${group.id}`)
      }
      noHover={!allowEdit}
      title={
        <div className="flex justify-between">
          {group.name} ({group.members.length}/{group.size})
          <div className="flex space-x-4" onClick={(e) => e.stopPropagation()}>
            {allowEdit &&
              (isMember ||
                (role && role !== "STUDENT" && role !== "ACADEMIC")) && (
                <>
                  <GroupEditDialogue group={group} update={onUpdate} />
                  <ActionDialogue
                    title="Delete Group"
                    description={
                      <>
                        Are you sure you want to delete group{" "}
                        <b>{group.name}</b>
                      </>
                    }
                    handleAction={handleDelete}
                  />
                </>
              )}
          </div>
        </div>
      }
      description={group.description}
      footerAttr={"justify-center pb-3 flex-grow"}
      footer={
        allowEdit &&
        role &&
        role === "STUDENT" && (
          <>
            {isMember ? (
              <Button
                className="w-[5rem]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeave();
                }}
              >
                Leave
              </Button>
            ) : isPending ? (
              isPending === "Request" ? (
                <Button className="w-[9rem]" onClick={handleCancelRequest}>
                  Cancel Request
                </Button>
              ) : (
                <div className="flex gap-6">
                  <Button className="w-[5rem]" onClick={handleRejectInvite}>
                    Reject
                  </Button>
                  <Button className="w-[5rem]" onClick={handleAcceptInvite}>
                    Accept
                  </Button>
                </div>
              )
            ) : (
              <>
                {group.members.length < group.size ? (
                  <Button className="w-[5rem]" onClick={handleRequest}>
                    Request
                  </Button>
                ) : (
                  <b>Group Full</b>
                )}
              </>
            )}
          </>
        )
      }
    />
  );
};

export default GroupCardThumbnail;
