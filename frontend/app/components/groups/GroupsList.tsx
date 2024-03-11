"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "../SearchBar";
import GroupCreateDialogue from "./GroupCreateDialogue";
import { GroupMemberType, GroupType, getGroups } from "../../utils/GroupUtils";
import GroupCardThumbnail from "./GroupCardThumbnail";
import { useToast } from "../ui/use-toast";
import { Heading2 } from "../Typography";
import { getGroupInvites, getGroupRequests } from "@/app/utils/UserUtils";

const GroupsList = ({ role }: { role: string }) => {
  const { toast } = useToast();
  const [allGroups, setAllGroups] = useState<GroupType[]>([]);
  const [filteredMemberGroups, setFilteredMemberGroups] = useState<GroupType[]>(
    []
  );
  const [filteredPendingGroups, setFilteredPendingGroups] = useState<
    GroupType[]
  >([]);
  const [filteredInvitiations, setFilteredInvitiations] = useState<GroupType[]>(
    []
  );
  const [filteredNonmemberGroups, setFilteredNonmemberGroups] = useState<
    GroupType[]
  >([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupType[]>([]);

  useEffect(() => {
    getAllGroups();
  }, []);

  const getAllGroups = async () => {
    setFilteredPendingGroups([]);
    const fail = (error: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    };
    const success = (data: any) => {
      setAllGroups(data.groups);
      getGroupRequests((pendingData) => {
        getGroupInvites((invitationsData) => {
          filterGroups(
            data.groups,
            pendingData.requests,
            invitationsData.invites
          );
        }, fail);
      }, fail);
    };

    getGroups(success, fail);
  };

  const onInputChange = (value: string) => {
    const valueLower = value.toLowerCase();
    const newProjects = allGroups.filter(
      (group) =>
        group.name.toLowerCase().includes(valueLower) ||
        group.description.toLowerCase().includes(valueLower)
    );
    filterGroups(newProjects, filteredPendingGroups, filteredInvitiations);
  };

  const filterGroups = (
    groups: GroupType[],
    pendingGroups: GroupType[],
    invitedGroups: GroupType[]
  ) => {
    const uId = localStorage.getItem("uID");
    if (uId && role) {
      if (role == "STUDENT") {
        const pendingIds = pendingGroups.map((g: GroupType) => g.id);
        const filteredPending = groups.filter((g: GroupType) =>
          pendingIds.includes(g.id)
        );
        const inviteIds = invitedGroups.map((g: GroupType) => g.id);
        const filteredInvite = groups.filter((g: GroupType) =>
          inviteIds.includes(g.id)
        );
        setFilteredPendingGroups(filteredPending);
        setFilteredInvitiations(filteredInvite);

        const filteredOutPending = groups.filter(
          (g: GroupType) =>
            !pendingIds.includes(g.id) && !inviteIds.includes(g.id)
        );
        setFilteredMemberGroups(
          filteredOutPending.filter((g) => isMember(g.members, uId))
        );
        setFilteredNonmemberGroups(
          filteredOutPending.filter((g) => !isMember(g.members, uId))
        );
      } else {
        setFilteredGroups(groups);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to detect user. Please sign out and try again.",
      });
    }
  };

  const isMember = (g: GroupMemberType[], uId: string) => {
    for (const member of g) {
      if (member.id == uId) return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center w-full flex-col md:flex-row md:justify-between gap-4 md:gap-0">
        <SearchBar
          searchPlaceholder="Search for a group"
          onInputChange={onInputChange}
        />
        {role && role == "STUDENT" && (
          <GroupCreateDialogue onUpdate={getAllGroups} />
        )}
      </div>
      {role && role === "STUDENT" && (
        <div className="flex flex-col">
          {filteredMemberGroups.length !== 0 && (
            <div className="mt-6">
              <Heading2>Joined Groups</Heading2>
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))] gap-[2rem]">
                {filteredMemberGroups.map((g) => (
                  <GroupCardThumbnail
                    key={`group-${g.id}`}
                    group={g}
                    allowEdit={true}
                    onUpdate={getAllGroups}
                    role={role}
                  />
                ))}
              </div>
            </div>
          )}
          {filteredInvitiations.length !== 0 && (
            <div className="mt-6">
              <Heading2>Invitations</Heading2>
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))] gap-[2rem]">
                {filteredInvitiations.map((g) => (
                  <GroupCardThumbnail
                    key={`group-${g.id}`}
                    group={g}
                    allowEdit={true}
                    onUpdate={getAllGroups}
                    role={role}
                    isPending="Invite"
                  />
                ))}
              </div>
            </div>
          )}
          {filteredPendingGroups.length !== 0 && (
            <div className="mt-6">
              <Heading2>Pending Groups</Heading2>
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))] gap-[2rem]">
                {filteredPendingGroups.map((g) => (
                  <GroupCardThumbnail
                    key={`group-${g.id}`}
                    group={g}
                    allowEdit={true}
                    onUpdate={getAllGroups}
                    role={role}
                    isPending="Request"
                  />
                ))}
              </div>
            </div>
          )}
          {filteredNonmemberGroups.length != 0 && (
            <div className="mt-6">
              <Heading2>Unjoined Groups</Heading2>
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))] gap-[2rem]">
                {filteredNonmemberGroups.map((g) => (
                  <GroupCardThumbnail
                    key={`group-${g.id}`}
                    group={g}
                    allowEdit={true}
                    onUpdate={getAllGroups}
                    role={role}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {role && role !== "STUDENT" && (
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(290px,_1fr))] gap-[2rem] mt-6">
          {filteredGroups.length != 0 &&
            filteredGroups.map((g) => (
              <GroupCardThumbnail
                key={`group-${g.id}`}
                group={g}
                allowEdit={true}
                onUpdate={getAllGroups}
                role={role}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default GroupsList;
