"use client";

import React, { useEffect, useState } from "react";
import SearchBar from "../SearchBar";
import UserCard from "./UserCard";
import {
  formatUserType,
  userDataType,
  getUsersVisible,
} from "../../utils/UserUtils";
import { getAllUsers } from "../../utils/AdminUtils";
import { useToast } from "../ui/use-toast";

type UsersListProps = {
  isAdmin: boolean;
};

const UsersList = ({ isAdmin }: UsersListProps) => {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<userDataType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<userDataType[]>([]);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(filteredUsers);
  }, [allUsers]);

  const getUsers = async () => {
    const fail = (error: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    };

    const success = (data: any) => {
      setAllUsers(data.users);
      setFilteredUsers(data.users);
    };
    isAdmin ? getAllUsers(success, fail) : getUsersVisible(success, fail);
  };

  const onSearchChange = (value: string) => {
    const valueLower = value.toLowerCase();
    let newUsers = allUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      const type = formatUserType(user.type);
      return (
        user.firstName.toLowerCase().includes(valueLower) ||
        user.lastName.toLowerCase().includes(valueLower) ||
        fullName.toLowerCase().includes(valueLower) ||
        user.email.toLowerCase().includes(valueLower) ||
        type.toLowerCase().includes(valueLower) ||
        user.school?.toLowerCase().includes(valueLower) ||
        user.degree?.toLowerCase().includes(valueLower)
      );
    });
    setFilteredUsers(newUsers);
  };
  return (
    <div className="flex flex-col">
      <SearchBar
        searchPlaceholder="Search for a user..."
        onInputChange={onSearchChange}
      />
      <div className="mt-6">
        {filteredUsers.length > 0 &&
          filteredUsers.map((user) => (
            <UserCard
              key={`user-${user.id}`}
              user={user}
              update={getUsers}
              isAdmin={isAdmin}
            />
          ))}
      </div>
    </div>
  );
};

export default UsersList;
