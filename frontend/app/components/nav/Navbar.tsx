"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "../ModeToggle";
import AuthLogOutModal from "../auth/AuthLogoutModal";
import { useEffect } from "react";
import { useAccessControlContext } from "../../context/accessControl";
import { fetchUserData } from "../../utils/UserUtils";
import { useToast } from "../ui/use-toast";
import { usePathname } from "next/navigation";
import NavHamburger from "./NavMenu";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { toast } = useToast();
  const pathname = usePathname();
  const [avatar, setAvatar] = useState<string>("");
  const { role, setRole } = useAccessControlContext();

  const linkClass = (path: string) => {
    return `font-bold ml-9 transition-opacity duration-300 ${pathname === path ? "opacity-100" : "opacity-[55%]"
      } hover:opacity-100`;
  };

  useEffect(() => {
    if (localStorage.getItem("uID")) {
      fetchUserData(
        (userRes) => {
          setAvatar(userRes.avatar);
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
    }
  }, []);

  return (
    <>
      <div className="flex justify-between p-5 items-center w-full border-b-8 border-black-500 border-solid">
        <div className="flex flex-row items-center">
          <Link className="font-extrabold text-xl sm:text-2xl" href="/">
            Course Insights
          </Link>
          {role && (
            <div className="hidden lg:block">
              <Link className={linkClass("/dashboard")} href="/dashboard">
                Dashboard
              </Link>
              <Link className={linkClass("/courses")} href="/courses">
                Courses
              </Link>
              <Link className={linkClass("/projects")} href="/projects">
                Projects
              </Link>
              <Link className={linkClass("/groups")} href="/groups">
                Groups
              </Link>
              <Link className={linkClass("/users")} href="/users">
                Users
              </Link>
            </div>
          )}
        </div>

        <div className="lg:flex flex-row justify-center items-center hidden relative space-x-5 ">
          <ModeToggle />
          {role && (
            <>
              <AuthLogOutModal
                trigger={
                  <Button size="icon">
                    <LogOut className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                }
              />
              <Link href="/profile">
                <Image
                  src={avatar || "/assets/defaultAvatar.jpg"}
                  width={48}
                  height={48}
                  className="w-[3rem] h-[3rem] rounded-full"
                  alt="Profile picture"
                />
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center lg:hidden space-x-3">
          <ModeToggle />
          {role && <NavHamburger />}
        </div>
      </div>
    </>
  );
};

export default Navbar;
