"use client";
import React, { useEffect, useState } from "react";
import ProfileDetails from "../../components/profile/ProfileDetails";
import Navbar from "../../components/nav/Navbar";
import ProficiencyList from "../../components/ProficiencyList";
import ExperienceList from "../../components/profile/ExperienceList";
import CardList from "../../components/CardList";
import ProjectCard from "../../components/ProjectCard";
import GroupCard from "../../components/GroupCard";
import {
  addExperience,
  deleteExperience,
  editExperience,
  fetchOtherUserData,
  fetchUserVisualData,
  fetchUserData,
  getUserIsShared,
} from "@/app/utils/UserUtils";
import { UserProps } from "@/app/components/types";
import { wordCloudData } from "@/app/utils/SummaryUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";
import { GroupType, getGroup } from "@/app/utils/GroupUtils";
import { ProjectType } from "@/app/utils/ProjectUtils";

export default function UserProfile({
  params: { id },
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProps | any>({});
  const [isAuthUser, setAuthUser] = useState<boolean>(false);
  const [userIsShared, setUserIsShared] = useState<boolean>(true);
  const [userVisualData, setUserVisualData] = useState<
    wordCloudData[] | undefined
  >(undefined);
  const [groups, setGroups] = useState<GroupType[]>([]);

  const fromEmail = searchParams.get("fromEmail");

  useEffect(() => {
    getOtherUser();
    fetchUserVisualData(
      id,
      (userRes) => {
        let summaryValues = userRes.summary.map((x) => {
          return { word: x.phrase, value: x.score, group: x.source };
        });
        setUserVisualData(summaryValues);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    );
  }, []);

  const goBackOrDashboard = () => {
    if (fromEmail !== "true") {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const getOtherUser = () => {
    fetchOtherUserData(
      id,
      (userRes) => {
        if (userRes.type === "ADMIN" || userRes.type === "ACADEMIC_ADMIN") {
          setAuthUser(true);
        }
        setUser(userRes);
        getGroupData(userRes.groups);
      },
      (error) => {
        setUserIsShared(false);
      }
    );
  };

  const getGroupData = (groups: GroupType[]) => {
    const groupPromises: Promise<GroupType>[] = [];
    for (let group of groups) {
      const groupPromise: Promise<GroupType> = new Promise(
        (resolve, reject) => {
          const onSuccess = (res: any) => {
            resolve({ id: group.id, ...res.group });
          };
          getGroup(group.id, onSuccess, onError);
        }
      );
      groupPromises.push(groupPromise);
    }
    Promise.all(groupPromises).then((res) => setGroups(res));
  };

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  const handleAddExperience = (
    apiCall: CallableFunction,
    experience: string
  ) => {
    apiCall(id ?? "", experience, getOtherUser, onError);
  };

  const handleDeleteExperience = (
    apiCall: CallableFunction,
    experience: string
  ) => {
    apiCall(id ?? "", experience, getOtherUser, onError);
  };

  const handleEditExperience = (
    apiCall: CallableFunction,
    oldExperience: string,
    newExperience: string
  ) => {
    apiCall(id ?? "", oldExperience, newExperience, getOtherUser, onError);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Navbar />
      <div className="flex justify-center items-center flex-col md:items-start md:pl-3 md:flex-row w-full">
        <ArrowLeft
          className="md:mr-6 mt-8 hover:text-slate-400 max-md:w-full hover:cursor-pointer"
          strokeWidth={2.25}
          onClick={() => goBackOrDashboard()}
        />
        {userIsShared ? (
          <div className="flex flex-col items-center w-full my-8 px-3 lg:w-[80rem]">
            <div className="w-full">
              {user && (
                <ProfileDetails
                  user={user}
                  isAuthUser={false}
                  onUpdate={getOtherUser}
                />
              )}
            </div>
            {user.type === "STUDENT" && (
              <ProficiencyList
                title="Skills and Knowledge"
                list={userVisualData?.map((x) => x.word)}
                visualData={userVisualData}
              />
            )}
            <ExperienceList
              experienceProps={{
                experienceTitle: "Work Experience",
                experienceType: "Work Experience",
                experiences: user?.workExperience,
              }}
              onAdd={(experience) =>
                handleAddExperience(addExperience, experience)
              }
              onDelete={(experience) =>
                handleDeleteExperience(deleteExperience, experience)
              }
              isAuthUser={isAuthUser}
              onEdit={(oldExperience, newExperience) => {
                handleEditExperience(
                  editExperience,
                  oldExperience,
                  newExperience
                );
              }}
            />
            {user.type !== "ADMIN" && (
              <div className="flex flex-col items-center justify-between w-full gap-4 lg:flex-row">
                {user.ownedProjects && (
                  <CardList
                    title={
                      user.type === "STUDENT" ? "Projects" : "Owned Projects"
                    }
                    emptyCardList="No projects to show"
                    cardList={user?.ownedProjects?.map(
                      (project: ProjectType, idx: number) => (
                        <ProjectCard key={idx} project={project} />
                      )
                    )}
                  />
                )}
                {user.type === "STUDENT" && groups.length > 0 && (
                  <CardList
                    title={"Groups"}
                    emptyCardList="Not a member of any group"
                    cardList={groups.map((group: GroupType, idx: any) => (
                      <GroupCard key={idx} group={group} isMember={true} />
                    ))}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center w-[80rem] ">
            <div className="text-2xl">
              Forbidden: This user hasn't shared their profile with you.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
