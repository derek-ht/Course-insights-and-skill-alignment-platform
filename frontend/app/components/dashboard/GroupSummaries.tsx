import React from "react";
import Image from "next/image";
import AuthVector from "/public/assets/auth_vector.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

const GroupSummaries = () => {
  return (
    <>
      <div className="my-12 ml-6 flex items-center w-1/2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around w-full h-[30rem]">
            <ScrollArea className="w-full rounded-md border p-4">
              <div>
                <div className="mx-4 mt-4 rounded transition ease-in-out delay-15 hover:bg-slate-50 cursor-pointer">
                  <Button variant="link" className="text-lg">
                    Group 1
                  </Button>
                  <div className="flex gap-2 px-4 pt-2">
                    <HoverCard>
                      <HoverCardTrigger>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h4 className="font-bold text-lg">user 1</h4>
                        <p className="text-xs">user1@email.com</p>
                        <p>skill 1</p>
                        <p>skill 2</p>
                        <p>skill 3</p>
                        <p>skill 4</p>
                      </HoverCardContent>
                    </HoverCard>
                    <HoverCard>
                      <HoverCardTrigger>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h4 className="font-bold text-lg">user 2</h4>
                        <p className="text-xs">user1@email.com</p>
                        <p>skill 1</p>
                        <p>skill 2</p>
                        <p>skill 3</p>
                        <p>skill 4</p>
                      </HoverCardContent>
                    </HoverCard>
                    <HoverCard>
                      <HoverCardTrigger>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h4 className="font-bold text-lg">user 3</h4>
                        <p className="text-xs">user1@email.com</p>
                        <p>skill 1</p>
                        <p>skill 2</p>
                        <p>skill 3</p>
                        <p>skill 4</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div className="px-4 py-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Curabitur malesuada dolor vitae nunc vestibulum sagittis.
                    Curabitur ultrices nibh et dictum posuere. Donec accumsan,
                    tellus vel rhoncus aliquam, nibh elit commodo sapien, ac
                    vestibulum ipsum nulla feugiat nisl. Ut vulputate aliquam
                    hendrerit. Suspendisse vel magna in nulla sagittis pretium
                    ac vel tortor. Proin condimentum, lorem egestas euismod
                    dignissim, ex erat pharetra tellus, sed pretium eros elit
                    sed lectus. Duis non auctor tortor.
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="mx-4 mt-4 rounded transition ease-in-out delay-15 hover:bg-slate-50 cursor-pointer">
                  <Button variant="link" className="text-lg">
                    Group 2
                  </Button>
                  <div className="flex gap-2 px-4 pt-2">
                    <HoverCard>
                      <HoverCardTrigger>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h4 className="font-bold text-lg">user 1</h4>
                        <p className="text-xs">user1@email.com</p>
                        <p>skill 1</p>
                        <p>skill 2</p>
                        <p>skill 3</p>
                        <p>skill 4</p>
                      </HoverCardContent>
                    </HoverCard>
                    <HoverCard>
                      <HoverCardTrigger>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h4 className="font-bold text-lg">user 2</h4>
                        <p className="text-xs">user1@email.com</p>
                        <p>skill 1</p>
                        <p>skill 2</p>
                        <p>skill 3</p>
                        <p>skill 4</p>
                      </HoverCardContent>
                    </HoverCard>
                    <HoverCard>
                      <HoverCardTrigger>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <Avatar>
                          <AvatarImage src="/assets/defaultAvatar.jpg" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <h4 className="font-bold text-lg">user 3</h4>
                        <p className="text-xs">user1@email.com</p>
                        <p>skill 1</p>
                        <p>skill 2</p>
                        <p>skill 3</p>
                        <p>skill 4</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div className="px-4 py-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Curabitur malesuada dolor vitae nunc vestibulum sagittis.
                    Curabitur ultrices nibh et dictum posuere. Donec accumsan,
                    tellus vel rhoncus aliquam, nibh elit commodo sapien, ac
                    vestibulum ipsum nulla feugiat nisl. Ut vulputate aliquam
                    hendrerit. Suspendisse vel magna in nulla sagittis pretium
                    ac vel tortor. Proin condimentum, lorem egestas euismod
                    dignissim, ex erat pharetra tellus, sed pretium eros elit
                    sed lectus. Duis non auctor tortor.
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GroupSummaries;
