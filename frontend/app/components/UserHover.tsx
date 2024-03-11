import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { UserHoverProps } from "./types";

const UserBubble = ({
  avatar,
  firstName,
  lastName,
  email,
  skills,
}: UserHoverProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>Profile Picture</AvatarFallback>
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent>
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>Profile Picture</AvatarFallback>
        </Avatar>
        <h4 className="font-bold text-lg">{firstName} {lastName}</h4>
        <p className="text-xs">{email}</p>
        {skills?.length > 0 && <>
          <p className="text-md underline">Skills</p>
          {skills
            .sort((a, b) => parseInt(b.score) - parseInt(a.score))
            .slice(0, 5)
            .map((skill, idx) => (
              <p key={idx}>{skill.phrase}</p>
            ))}
        </>
        }
      </HoverCardContent>
    </HoverCard>
  );
};
export default UserBubble;
