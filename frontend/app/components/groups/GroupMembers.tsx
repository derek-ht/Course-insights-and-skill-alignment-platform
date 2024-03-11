import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { GroupMemberType, GroupType } from "@/app/utils/GroupUtils";
import GroupMemberAvatar from "./GroupMemberAvatar";
import GroupMembersDialogue from "./GroupMembersDialogue";

const MAX_DISPLAY_MEMBERS = 5;
const GroupMembers = ({ group }: { group: GroupType | any }) => {
  const [filteredMembers, setFilteredMembers] = useState<GroupMemberType[]>([]);

  useEffect(() => {
    setFilteredMembers(group.members.slice(0, MAX_DISPLAY_MEMBERS));
  }, [group]);
  return (
    <Card className="p-5">
      <CardHeader className="pl-0">
        <CardTitle>
          Members ({group.members.length}/{group.size})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredMembers.map((u: GroupMemberType) => (
          <GroupMemberAvatar key={`user-${u.id}`} member={u} />
        ))}
        {group.members.length > MAX_DISPLAY_MEMBERS && (
          <div className="flex justify-center mt-2">
            <GroupMembersDialogue group={group} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default GroupMembers;
