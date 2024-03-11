import React from "react";
import { Button } from "./ui/button";
import { ProjectType } from "../utils/ProjectUtils";
import { useRouter } from "next/navigation";

const ProjectCard = ({ project }: { project: ProjectType | any }) => {
  const router = useRouter();
  return (
    <div
      className="mx-4 mt-4 rounded transition ease-in-out delay-15 hover:bg-slate-50 dark:hover:bg-slate-50/10 cursor-pointer"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <Button variant="link" className="text-lg h-fit">
        {project.title}
      </Button>
      <div className="px-4 text-opacity-70"></div>
      <div className="px-4 py-4">
        {project.description.substring(0, 300)}
        {project.description.length >= 300 && "..."}
      </div>
    </div>
  );
};

export default ProjectCard;
