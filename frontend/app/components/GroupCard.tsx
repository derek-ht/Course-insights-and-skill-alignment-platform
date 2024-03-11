import React from "react";
import { Button } from "./ui/button";
import UserHover from "./UserHover";
import { GroupType } from "../utils/GroupUtils";
import { useRouter } from "next/navigation";
import { UserSkills } from "./types";

const GroupCard = ({
  group,
  isMember,
  isRecommendation,
}: {
  group: GroupType | any;
  isMember?: boolean;
  isRecommendation?: boolean;
}) => {
  const router = useRouter();
  const hoverTransition = isMember
    ? "hover:bg-slate-50 dark:hover:bg-slate-50/10 cursor-pointer"
    : "hover:bg-slate-50 dark:hover:bg-slate-50/10 cursor-default";
  return (
    <div
      className={
        "mx-4 mt-4 rounded transition ease-in-out delay-15 " + hoverTransition
      }
      onClick={() => {
        isMember
          ? router.push(`/groups/${group.id}`)
          : isRecommendation && router.push(`/groups`);
      }}
    >
      <Button variant="link" className="text-lg">
        {group.name}
      </Button>
      <div className="flex gap-2 px-4 pt-2">
        {group.members.length > 0 &&
          group.members.map((user: any, idx: number) => (
            <UserHover key={idx} {...user} />
          ))}
      </div>

      {group.description && (
        <div className="px-4 text-muted-foreground overflow-ellipsis whitespace-nowrap overflow-hidden">
          {group.description}
        </div>
      )}
      {group.skills.length > 0 && (
        <div className="px-4 py-4">
          <p className="text-md font-bold">Top Skills</p>
          <ol className="list-decimal">
            {group.skills &&
              group.skills
                .sort(
                  (a: UserSkills, b: any) =>
                    parseInt(b.score) - parseInt(a.score)
                )
                .slice(0, 5)
                .map((s: any, idx: any) => (
                  <li key={idx} className="ml-4">
                    {s.phrase}
                  </li>
                ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default GroupCard;
