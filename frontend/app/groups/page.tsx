"use client";
import React, { useEffect } from "react";
import Navbar from "../components/nav/Navbar";
import Main from "../components/layout/Main";
import Heading from "../components/layout/Heading";
import GroupsList from "../components/groups/GroupsList";
import { useToast } from "../components/ui/use-toast";
import { useAccessControlContext } from "../context/accessControl";
import { fetchUserData } from "../utils/UserUtils";

const Groups = () => {
  const { role, setRole } = useAccessControlContext();
  const { toast } = useToast();
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
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex w-full justify-center">
        <Main>
          <Heading>All Groups</Heading>
          {role && <GroupsList role={role} />}
        </Main>
      </div>
    </>
  );
};

export default Groups;
