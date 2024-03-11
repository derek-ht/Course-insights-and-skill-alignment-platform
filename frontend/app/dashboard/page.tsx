"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/nav/Navbar";
import CourseSummaries from "../components/dashboard/CourseSummaries";
import DashboardRecommended from "../components/dashboard/DashboardRecommended";
import CardList from "../components/CardList";
import GroupCard from "../components/GroupCard";
import ProjectCard from "../components/ProjectCard";
import { useToast } from "../components/ui/use-toast";
import { useAccessControlContext } from "../context/accessControl";
import { fetchUserData } from "../utils/UserUtils";
import { recommendedGroups, recommendedProjects } from "../utils/UserUtils";
import { GroupType } from "../utils/GroupUtils";
import { ProjectType } from "../utils/ProjectUtils";
import GroupSkeleton from "../components/skeletons/GroupSkeleton";
import ProjectSkeleton from "../components/skeletons/ProjectSkeleton";

const Dashboard = () => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(true);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { role, setRole } = useAccessControlContext();

  useEffect(() => {
    fetchUserData(
      (userRes) => {
        setRole(userRes.type);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    );
    const uId = localStorage.getItem("uID");
    if (uId) {
      recommendedGroups(
        uId,
        (res: any) => {
          setGroups(res.groups);
          setGroupsLoading(false);
        },
        onError
      );
      recommendedProjects(
        uId,
        (res: any) => {
          setProjects(res.projects);
          setProjectsLoading(false);
        },
        onError
      );
    }
  }, []);

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };
  return (
    <div className="w-full flex flex-col items-center ">
      <Navbar />
      <div className="flex flex-col justify-center items-center w-full px-3 mt-6 lg:mt-12  lg:px-0 md:w-[40rem] lg:w-[60rem] xl:w-[80rem]">
        <CourseSummaries />
        <div className="w-full flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
          <CardList
            title={"Recommended Projects"}
            cardList={projects.map((project, idx) => (
              <ProjectCard key={idx} project={project} />
            ))}
            skeleton={projectsLoading && <ProjectSkeleton />}
            emptyCardList="No available recommendations"
          />
          <CardList
            title={"Recommended Groups"}
            cardList={groups.map((group, idx) => (
              <GroupCard key={idx} group={group} isRecommendation={true} />
            ))}
            skeleton={groupsLoading && <GroupSkeleton />}
            emptyCardList="No available recommendations"
          />
        </div>
        {role && role === "STUDENT" && <DashboardRecommended />}
      </div>
    </div>
  );
};

export default Dashboard;
