"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Navbar from "../../components/nav/Navbar";
import Main from "../../components/layout/Main";
import React, { useEffect, useState } from "react";
import ProjectCardThumbnail from "../../components/projects/ProjectCardThumbnail";
import { GridContainer } from "../../components/Container";
import {
  GroupType,
  getGroup,
  getGroupInvites,
  getGroupRequests,
  getRecommendUsersToGroup,
  inviteUserToGroup,
  recommendedProjects,
  rejectGroupRequest,
  uninviteUserToGroup,
  userIsMember,
} from "../../utils/GroupUtils";
import CardThumbnail from "@/app/components/CardThumbnail";
import GroupMembers from "@/app/components/groups/GroupMembers";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProjectType } from "@/app/utils/ProjectUtils";
import { getProject } from "@/app/utils/ProjectUtils";
import { useToast } from "@/app/components/ui/use-toast";
import { useAccessControlContext } from "@/app/context/accessControl";
import { fetchUserData } from "@/app/utils/UserUtils";
import { UserProps } from "@/app/components/types";
import BasicCard from "@/app/components/BasicCard";
import RecommendedUsersList from "@/app/components/dashboard/RecommendedUsersList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Button } from "@/app/components/ui/button";
import { WordCloudChart } from "@carbon/charts-react";
import { visualData, wordCloudData } from "@/app/utils/SummaryUtils";
import "@carbon/charts-react/styles.css";

const GroupSummary = ({ params: { id } }: { params: { id: string } }) => {
  const { role, setRole } = useAccessControlContext();
  const { toast } = useToast();
  const router = useRouter();
  const [group, setGroup] = useState<GroupType>();
  const [project, setProject] = useState<ProjectType>();
  const [projectsList, setProjectsList] = useState<ProjectType[]>([]);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loadingRecommended, setLoadingRecommended] = useState<boolean>(true);
  const [recommendedUsers, setRecommendedUsers] = useState<UserProps[]>([]);
  const [filteredRecommendedUsers, setFilteredRecommendedUsers] = useState<
    UserProps[]
  >([]);
  const [filteredInterestedUsers, setFilteredInterestedUsers] = useState<
    UserProps[]
  >([]);
  const [interestedUsers, setInterestedUsers] = useState<UserProps[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<UserProps[]>([]);
  const [visualSkills, setVisualSkills] = useState<wordCloudData[]>([]);

  const fail = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  useEffect(() => {
    getGroupData();
    fetchUserData((userRes) => {
      setRole(userRes.type);
    }, fail);
    getRecommendedProjects();
  }, []);

  const updateGroupInvitations = () => {
    getGroupRequests(
      id,
      async (data) => {
        setInterestedUsers(data.requests);
        setFilteredInterestedUsers(data.requests);
      },
      fail
    );
    getGroupInvites(
      id,
      async (data: any) => {
        setInvitedUsers(data.invites);
      },
      fail
    );
    getRecommendUsersToGroup(
      id,
      async (data) => {
        setRecommendedUsers(data.users);
        setFilteredRecommendedUsers(data.users);
        setLoadingRecommended(false);
      },
      fail
    );
  };

  const rejectRequest = async (uId: string) => {
    rejectGroupRequest(
      id,
      uId,
      async (data) => {
        updateGroupInvitations();
      },
      fail
    );
  };

  const handleInvite = async (uId: string) => {
    inviteUserToGroup(
      id,
      uId,
      async (data) => {
        getGroupData();
      },
      fail
    );
  };

  const cancelInvite = async (uId: string) => {
    uninviteUserToGroup(
      id,
      uId,
      async (data) => {
        updateGroupInvitations();
      },
      fail
    );
  };

  useEffect(() => {
    const pendingStateIds = invitedUsers.map((u) => u.id);
    const allRecommended = recommendedUsers.filter(
      (u: UserProps) => !pendingStateIds.includes(u.id)
    );
    const allInterested = interestedUsers.filter(
      (u: UserProps) => !pendingStateIds.includes(u.id)
    );
    setFilteredRecommendedUsers(allRecommended);
    setFilteredInterestedUsers(allInterested);
  }, [interestedUsers, invitedUsers, recommendedUsers]);

  const getGroupData: any = () => {
    const onSuccess = (data: any) => {
      const uId = localStorage.getItem("uID");
      if (uId == null) return;
      setGroup(data.group);
      setIsMember(userIsMember(uId, data.group));
      if (data.group.project) {
        getGroupProject(data.group.project.id)
          .then((fetchedProject: ProjectType) => setProject(fetchedProject))
          .catch(fail);
      }
      if (data.group.members.length !== data.group.size) {
        updateGroupInvitations();
      }
      if (data.group.skills) {
        const skills = data.group.skills.map((x: visualData) => {
          return { word: x.phrase, value: x.score, group: x.source };
        });
        setVisualSkills(skills);
      }
    };
    getGroup(id, onSuccess, fail);
  };

  const getGroupProject = (pId: string): Promise<ProjectType> => {
    return new Promise((resolve, reject) => {
      getProject(
        pId,
        (res: any) => resolve(res.project),
        (error: string) => reject(error)
      );
    });
  };

  const getRecommendedProjects = () => {
    recommendedProjects(id, (res: any) => setProjectsList(res.projects), fail);
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center">
        <Main>
          <div className="flex">
            <ArrowLeft
              className="mr-6 mt-2 hover:text-slate-400  hover:cursor-pointer"
              strokeWidth={2.25}
              onClick={() => {
                router.back();
              }}
            />
            <h1 className="flex-grow text-3xl font-bold pb-4">{group?.name}</h1>
          </div>
          <div className="flex flex-col md:flex-row lg:grid lg:grid-cols-[20rem,1fr] gap-8 mt-8 w-full">
            <div className="flex flex-col gap-4 lg:w-auto md:w-1/2">
              {group && (
                <CardThumbnail
                  noHover
                  title={group.name}
                  description={group.description}
                  imgAlt={`Group ${group.name} Cover Photo`}
                  imgSrc={group.coverPhoto}
                  imgAttr="h-[18rem] w-full object-cover mb-2"
                />
              )}
              <Card className="p-5">
                <CardHeader className="pl-0">
                  <CardTitle>Overall Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {visualSkills && (
                    <WordCloudChart
                      data={visualSkills}
                      options={{
                        resizable: true,
                        legend: {
                          enabled: false,
                        },
                        color: {
                          pairing: {
                            option: 2,
                          },
                        },
                        height: "20rem",
                      }}
                    />
                  )}
                </CardContent>
              </Card>
              {group && group.members.length > 0 && (
                <GroupMembers group={group} />
              )}
            </div>
            <div className="w-full">
              {project && (
                <>
                  <BasicCard
                    cardAttr="mb-6"
                    titleChildren="Current Projects"
                    contentAttr="w-auto"
                    contentChildren={<ProjectCardThumbnail project={project} />}
                  />
                </>
              )}
              {!project && (
                <>
                  <BasicCard
                    cardAttr="mb-6"
                    titleChildren="Recommended Projects"
                    contentAttr="w-full"
                    contentChildren={
                      <GridContainer>
                        {projectsList.length > 0 &&
                          projectsList.map((p) => (
                            <div key={`project-${p.id}`} className="w-auto">
                              <ProjectCardThumbnail project={p} />
                            </div>
                          ))}
                      </GridContainer>
                    }
                  />
                </>
              )}

              {role &&
                role == "STUDENT" &&
                isMember &&
                group &&
                group?.members.length !== group.size && (
                  <>
                    <BasicCard
                      titleChildren="Member Invites"
                      cardAttr="w-full"
                      contentAttr="w-full"
                      contentChildren={
                        <>
                          <Accordion type="multiple" orientation="horizontal">
                            {filteredInterestedUsers.length > 0 && (
                              <AccordionItem value="item-2">
                                <AccordionTrigger>
                                  Interested Candidates
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="w-full md:w-[20rem] lg:w-[47rem]">
                                    <RecommendedUsersList
                                      users={filteredInterestedUsers}
                                      footer={(id) => (
                                        <div className="flex gap-4">
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              rejectRequest(id);
                                            }}
                                          >
                                            Reject
                                          </Button>
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleInvite(id);
                                            }}
                                          >
                                            Accept
                                          </Button>
                                        </div>
                                      )}
                                    />
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}
                            {invitedUsers.length > 0 && (
                              <AccordionItem value="item-1">
                                <AccordionTrigger>
                                  Pending Invites
                                </AccordionTrigger>
                                <AccordionContent>
                                  <RecommendedUsersList
                                    users={invitedUsers}
                                    footer={(id) => (
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          cancelInvite(id);
                                        }}
                                      >
                                        Cancel Invite
                                      </Button>
                                    )}
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            )}
                            {(loadingRecommended ||
                              recommendedUsers.length > 0) && (
                              <AccordionItem value="item-3">
                                <AccordionTrigger>
                                  Recommended Users
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="w-full md:w-[20rem] lg:w-[47rem]">
                                    <RecommendedUsersList
                                      isLoading={loadingRecommended}
                                      users={filteredRecommendedUsers}
                                      footer={(id) => (
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleInvite(id);
                                          }}
                                        >
                                          Invite User
                                        </Button>
                                      )}
                                    />
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}
                          </Accordion>
                        </>
                      }
                    />
                  </>
                )}
            </div>
          </div>
        </Main>
      </div>
    </>
  );
};

export default GroupSummary;
