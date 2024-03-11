import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { UserProps } from "../types";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

type RecommendedUserCardProps = {
  user: UserProps;
  footer?: (id: string) => React.ReactElement | any;
};

const RecommendedUserCard = ({ user, footer }: RecommendedUserCardProps) => {
  const router = useRouter();

  return (
    <Card
      className="overflow-hidden rounded transition ease-in-out delay-15 hover:bg-slate-50 dark:hover:bg-slate-50/10 cursor-pointer w-full md:w-[13.7rem]"
      onClick={() => {
        router.push(`/profile/${user.id}`);
      }}
      key={user.id}
    >
      <div className="flex flex-col justify-between h-full">
        <CardContent className="flex flex-col items-center w-full h-full pt-6 pb-3">
          <Avatar className="w-[8rem] h-[8rem] md:w-1/2 md:h-auto mb-2">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>Avatar</AvatarFallback>
          </Avatar>
          <p className="text-lg font-bold text-center">
            {user.firstName} {user.lastName}
          </p>
          <HoverCard>
            <HoverCardTrigger>
              <p className="mb-2">
                {user.email && user.email.substring(0, 20)}
                {user.email && user.email.length >= 20 && "..."}
              </p>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto">
              <p>{user.email}</p>
            </HoverCardContent>
          </HoverCard>
          <div className="flex flex-col items-center justify-center">
            {user.skills &&
              user.skills
                .sort((a, b) => b.score - a.score)
                .map((skill) => skill.phrase)
                .slice(0, 4)
                .map((skill: string) => (
                  <p key={`user-${user.id}'s skill: ${skill}`}>{skill}</p>
                ))}
          </div>
        </CardContent>
        {footer && (
          <CardFooter
            className="justify-center pb-6 flex-grow justify-self-end"
            onClick={(e) => {
              router.push(`/profile/${user.id}`);
            }}
          >
            {footer(user.id)}
          </CardFooter>
        )}
      </div>
    </Card>
  );
};

export default RecommendedUserCard;
