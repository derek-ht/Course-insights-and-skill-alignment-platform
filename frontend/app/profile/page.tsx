"use client";
import React, { useEffect, useState } from "react";
import ProfileDetails from "../components/profile/ProfileDetails";
import Navbar from "../components/nav/Navbar";
import ProficiencyList from "../components/ProficiencyList";
import ExperienceList from "../components/profile/ExperienceList";
import CardList from "../components/CardList";
import ProjectCard from "../components/ProjectCard";
import GroupCard from "../components/GroupCard";
import {
  addExperience,
  deleteExperience,
  editExperience,
  fetchUserData,
  fetchUserVisualData,
} from "../utils/UserUtils";
import { UserProps } from "../components/types";
import { wordCloudData } from "../utils/SummaryUtils";
import { useToast } from "../components/ui/use-toast";
import { ProjectType } from "../utils/ProjectUtils";
import { GroupType, getGroup } from "../utils/GroupUtils";

const Profile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProps | any>({});
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [userVisualData, setUserVisualData] = useState<
    wordCloudData[] | undefined
  >(undefined);
  useEffect(() => {
    getUser();
    fetchUserVisualData(
      localStorage.getItem("uID") ?? "",
      (userRes) => {
        let summaryValues = userRes.summary.map((x) => {
          return { word: x.phrase, value: x.score, group: x.source };
        });
        setUserVisualData(summaryValues);
      },
      onError
    );
  }, []);

  const getUser = () => {
    fetchUserData((userRes) => {
      setUser(userRes);
      getGroupData(userRes.groups);
    }, onError);
  };

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
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

  // Adding, deleting and editing experience functions
  const handleAddExperience = (
    apiCall: CallableFunction,
    experience: string
  ) => {
    const uId = localStorage.getItem("uID");
    apiCall(uId ?? "", experience, getUser, onError);
  };

  const handleDeleteExperience = (
    apiCall: CallableFunction,
    experience: string
  ) => {
    const uId = localStorage.getItem("uID");
    apiCall(uId ?? "", experience, getUser, onError);
  };

  const handleEditExperience = (
    apiCall: CallableFunction,
    oldExperience: string,
    newExperience: string
  ) => {
    const uId = localStorage.getItem("uID");
    apiCall(uId ?? "", oldExperience, newExperience, getUser, onError);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Navbar />
      <div className="flex flex-col items-center w-full my-8 px-3 lg:px-0 lg:w-[60rem] xl:w-[80rem]">
        <div className="w-full">
          {user && (
            <ProfileDetails user={user} isAuthUser={true} onUpdate={getUser} />
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
          onAdd={(experience) => handleAddExperience(addExperience, experience)}
          onDelete={(experience) =>
            handleDeleteExperience(deleteExperience, experience)
          }
          isAuthUser={true}
          onEdit={(oldExperience, newExperience) => {
            handleEditExperience(editExperience, oldExperience, newExperience);
          }}
        />
        {user.type !== "ADMIN" && (
          <div className="flex flex-col items-center justify-between w-full gap-4 lg:flex-row">
            {user.ownedProjects && (
              <CardList
                title={user.type === "STUDENT" ? "Projects" : "Owned Projects"}
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
    </div>
  );
};

export default Profile;
