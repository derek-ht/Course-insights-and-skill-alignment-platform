"use client";
import {
  ArrowLeft,
  CheckCircle2,
  Share2,
  Star,
  User,
  Users,
} from "lucide-react";
import Navbar from "../../components/nav/Navbar";
import Main from "../../components/layout/Main";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/app/components/ui/card";
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import {
  ProjectType,
  getProject,
  getProjectGroups,
  joinableGroups,
} from "@/app/utils/ProjectUtils";
import ProjectJoinDialogue from "../../components/projects/ProjectJoinDialogue";
import { GroupType } from "../../utils/GroupUtils";
import GroupCardThumbnail from "../../components/groups/GroupCardThumbnail";
import Image from "next/image";
import BasicCard from "@/app/components/BasicCard";
import CardList from "@/app/components/CardList";
import { useToast } from "../../components/ui/use-toast";
import ProjectSkillGapDialogue from "@/app/components/projects/ProjectSkillGapDialogue";
import { useAccessControlContext } from "@/app/context/accessControl";
import { fetchUserData } from "@/app/utils/UserUtils";

const ProjectOverview = ({ params: { id } }: { params: { id: string } }) => {
  const { role, setRole } = useAccessControlContext();
  const { toast } = useToast();
  const router = useRouter();
  const [project, setProject] = useState<ProjectType>();
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [canJoinGroups, setCanJoinGroups] = useState<GroupType[]>([]);

  useEffect(() => {
    fetchUserData((userRes) => setRole(userRes.type), onError);
  }, []);

  useEffect(() => {
    getProjectInfo();
  }, []);

  const getProjectInfo = () => {
    getProject(
      id,
      (res) => {
        setProject(res.project);
        getGroups();
      },
      (error: string) => onError(error)
    );
  };

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  const getGroups = () => {
    getProjectGroups(
      id,
      (res) => {
        setGroups(res.groups);
        getJoinableGroups(res.groups);
      },
      onError
    );
  };

  const getJoinableGroups = (currentGroups: GroupType[]) => {
    joinableGroups(
      id,
      (res: any) => {
        // Only display groups that haven't already joined the project
        const filteredGroups = res.groups.filter((g: GroupType) => {
          return currentGroups.findIndex((c) => c.id == g.id) === -1;
        });
        setCanJoinGroups(filteredGroups);
      },
      onError
    );
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center">
        <Main>
          <div className="flex flex-col md:flex-row">
            <ArrowLeft
              className="mr-6 mt-2 hover:text-slate-400"
              strokeWidth={2.25}
              onClick={() => {
                router.back();
              }}
            />
            <h1 className="flex-grow text-3xl font-bold pb-4">
              {project?.title}
            </h1>
            <div className="flex items-end gap-4">
              {project &&
                groups.length < project.maxGroupCount &&
                role &&
                role === "STUDENT" && (
                  <ProjectSkillGapDialogue
                    project={project}
                    update={getProjectInfo}
                    groups={canJoinGroups}
                  />
                )}
              {project &&
                groups.length < project.maxGroupCount &&
                role &&
                role === "STUDENT" && (
                  <ProjectJoinDialogue
                    project={project}
                    update={getGroups}
                    groups={canJoinGroups}
                  />
                )}
            </div>
          </div>
          <div className="grid md:grid-cols-[20rem,_1fr] lg:grid-cols-[24rem,_1fr] gap-8 my-8">
            <div className="flex flex-col gap-4">
              <BasicCard
                titleAttr="flex"
                titleChildren="Cover Photo"
                contentAttr="flex"
                contentChildren={
                  <Image
                    className="w-full h-[24rem] md:h-[16rem] object-cover"
                    src="/assets/defaultGroup.jpg"
                    alt="Project Cover"
                    width={300}
                    height={300}
                  />
                }
              />
              <div>
                <BasicCard
                  titleAttr="flex"
                  titleChildren="Description"
                  contentAttr="flex"
                  contentChildren={
                    <>
                      <ScrollArea className="h-[20rem]">
                        <div className="px-4">
                          {project && project.description}
                        </div>
                      </ScrollArea>
                    </>
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <BasicCard
                titleChildren="Scope"
                contentChildren={
                  <ScrollArea className="h-[20rem] px-8">
                    {project?.scope}
                  </ScrollArea>
                }
              />
              <BasicCard
                titleChildren="Topics"
                cardAttr="h-full"
                contentChildren={
                  <div className="flex-grow flex justify-around w-full">
                    <div className="w-full grid lg:grid-cols-2">
                      {project &&
                        project.topics.length > 0 &&
                        project.topics.map((o, idx) => (
                          <div key={idx} className="p-2">
                            <Card className="flex items-center bg-primary text-white dark:text-black">
                              <CardContent className="flex w-full p-4 items-center justify-between">
                                {o}
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                    </div>
                  </div>
                }
              />
            </div>
          </div>
          <div className="grid md:grid-cols-[20rem,_1fr] lg:grid-cols-[24rem,_1fr] gap-8 mb-4">
            <div>
              <BasicCard
                titleChildren="Project Size"
                contentAttr="h-[15rem]"
                contentChildren={
                  <div className="grid grid-cols-[3fr,_1fr] text-md items-center h-[10rem]">
                    <p>Minimum Group Members</p>
                    <GroupIcon value={project?.minGroupSize} icon={<User />} />
                    <p>Maximum Group Members</p>
                    <GroupIcon value={project?.maxGroupSize} icon={<Users />} />
                    <p>Maximum Group Count</p>
                    <GroupIcon
                      value={project?.maxGroupCount}
                      icon={<Share2 />}
                    />
                  </div>
                }
              />
            </div>
            <div className="flex flex-col gap-4">
              <CardList
                title="Required Skills"
                parentDivAttr="w-full"
                contentAttr="h-[15rem]"
                scrollAreaAttr="h-full rounded-md border px-4 pt-3"
                cardList={
                  project &&
                  project.requiredSkills.map((item, idx) => (
                    <div className="flex items-center mt-3" key={idx}>
                      <div className="w-fit">
                        <Star className="mr-2 " />
                      </div>
                      {item}
                    </div>
                  ))
                }
              />
              <CardList
                title="Expected Outcomes"
                parentDivAttr="w-full"
                contentAttr="h-[15rem]"
                scrollAreaAttr="h-full rounded-md border px-4 pt-3"
                cardList={
                  project &&
                  project.outcomes.map((item, idx) => (
                    <div className="flex items-center mt-3" key={idx}>
                      <div className="w-fit">
                        <CheckCircle2 size={24} className="mr-2" />
                      </div>
                      <p>{item}</p>
                    </div>
                  ))
                }
              />
            </div>
          </div>
          <BasicCard
            titleChildren={`Groups Working on this Project (${groups.length}/${project?.maxGroupCount})`}
            contentChildren={
              <ScrollArea className="w-full">
                <div className="flex gap-8 w-full">
                  {groups?.length > 0 ? (
                    <>
                      {groups.map((g, i) => (
                        <div
                          key={`group-${i}`}
                          className="w-[20rem] mx-2 mt-2 mb-6"
                        >
                          <GroupCardThumbnail
                            role=""
                            group={g}
                            onUpdate={getProjectInfo}
                          />
                        </div>
                      ))}
                    </>
                  ) : (
                    <>No groups joined yet</>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            }
          />
        </Main>
      </div>
    </>
  );
};

const GroupIcon = ({
  value,
  icon,
}: {
  value?: number;
  icon: React.ReactElement;
}) => {
  return (
    <div className={`flex rounded-md ml-2 p-2 min-w-[4rem] gap-1 w-fit h-fit`}>
      {icon}
      {value}
    </div>
  );
};

export default ProjectOverview;
