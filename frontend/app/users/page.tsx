"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/nav/Navbar";
import Main from "../components/layout/Main";
import Heading from "../components/layout/Heading";
import UsersList from "../components/users/UsersList";
import { fetchUserData } from "../utils/UserUtils";
import { useToast } from "../components/ui/use-toast";

const page = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasRoleLoaded, setHasRoleLoaded] = useState(false);

  useEffect(() => {
    const fetchIsAdmin = async () => {
      fetchUserData(
        (userRes) => {
          setIsAdmin(
            userRes.type === "ADMIN" || userRes.type === "ACADEMIC_ADMIN"
          );
          setHasRoleLoaded(true);
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
        }
      );
    };
    fetchIsAdmin();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <Main>
        <Heading>All Users</Heading>
        {hasRoleLoaded && <UsersList isAdmin={isAdmin} />}
      </Main>
    </div>
  );
};

export default page;
