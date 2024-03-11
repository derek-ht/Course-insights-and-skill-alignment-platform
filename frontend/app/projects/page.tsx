"use client";
import React, { useEffect } from "react";
import Navbar from "../components/nav/Navbar";
import Main from "../components/layout/Main";
import Heading from "../components/layout/Heading";
import ProjectsList from "../components/projects/ProjectsList";
import { useAccessControlContext } from "../context/accessControl";
import { fetchUserData } from "../utils/UserUtils";
import { useToast } from "../components/ui/use-toast";

const Projects = () => {
  const { role, setRole } = useAccessControlContext();
  const { toast } = useToast();
  useEffect(() => {
    fetchUserData(
      (userRes) => setRole(userRes.type),
      (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    );
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex w-full justify-center">
        <Main>
          {role === "ACADEMIC" ? (
            <Heading>Owned Projects</Heading>
          ) : (
            <Heading>All Projects</Heading>
          )}
          {role && <ProjectsList role={role} />}
        </Main>
      </div>
    </>
  );
};

export default Projects;
