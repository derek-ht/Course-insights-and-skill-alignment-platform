import React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  LogOut,
  Menu,
  User,
  Users,
  BookUser,
  GanttChartSquare,
  BookOpen,
  Presentation,
} from "lucide-react";
import { Dialog } from "../ui/dialog";
import AuthLogOutModal from "../auth/AuthLogoutModal";

const NavHamburger = () => {
  return (
    <Dialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[100vw] mt-6 rounded-none opacity-[97%]">
          <Link href="/profile">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <Link href="/dashboard">
            <DropdownMenuItem>
              <Presentation className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/courses">
            <DropdownMenuItem>
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </DropdownMenuItem>
          </Link>
          <Link href="/projects">
            <DropdownMenuItem>
              <GanttChartSquare className="mr-2 h-4 w-4" />
              Projects
            </DropdownMenuItem>
          </Link>
          <Link href="/groups">
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Groups
            </DropdownMenuItem>
          </Link>
          <Link href="/users">
            <DropdownMenuItem>
              <BookUser className="mr-2 h-4 w-4" />
              Users
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <AuthLogOutModal
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </Dialog>
  );
};

export default NavHamburger;
