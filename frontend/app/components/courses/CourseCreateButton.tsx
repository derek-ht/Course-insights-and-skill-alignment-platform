import { Plus } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

const CourseCreateButton = (props: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center mx-2 hover:cursor-pointer">
          <Plus className="w-4 h-auto" />
          <p className="font-semibold">Create Course</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={props.triggerLink}
        >
          via Course Page URL
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={props.triggerPdf}
        >
          via PDF File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface Props {
  triggerLink: () => void;
  triggerPdf: () => void;
}

export default CourseCreateButton;
