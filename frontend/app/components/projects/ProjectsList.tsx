import React, { useEffect, useState } from "react";
import SearchBar from "../SearchBar";
import {
  ProjectType,
  getAllProjects,
  getOwnedProjects,
} from "../../utils/ProjectUtils";
import ProjectCreateDialogue from "../projects/ProjectCreateDialogue";
import { useToast } from "../ui/use-toast";
import ProjectCardThumbnail from "./ProjectCardThumbnail";

const ProjectsList = ({ role }: { role: string }) => {
  const { toast } = useToast();
  const [allProjects, setAllProjects] = useState<ProjectType[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectType[]>([]);
  const [allowEdit, setAllowEdit] = useState<boolean>(
    role === "ADMIN" || role === "ACADEMIC_ADMIN"
  );

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = () => {
    if (role === "ACADEMIC") {
      getAcademicOwnerProjects();
    } else {
      getUserProjects();
    }
    if (role !== "STUDENT") {
      setAllowEdit(true);
    }
  };
  const getAcademicOwnerProjects = () =>
    getOwnedProjects(onGetProjectSuccess, onError);
  const getUserProjects = () => getAllProjects(onGetProjectSuccess, onError);

  const onGetProjectSuccess = (res: any) => {
    setAllProjects(res.projects);
    setFilteredProjects(res.projects);
  };
  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  };

  const onInputChange = (value: string) => {
    const valueLower = value.toLowerCase();
    const newProjects = allProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(valueLower) ||
        project.scope.toLowerCase().includes(valueLower) ||
        project.topics.findIndex((t) =>
          t.toLowerCase().includes(valueLower)
        ) !== -1 ||
        project.requiredSkills.findIndex((s) =>
          s.toLowerCase().includes(valueLower)
        ) !== -1 ||
        project.outcomes.findIndex((s) =>
          s.toLowerCase().includes(valueLower)
        ) !== -1
    );
    setFilteredProjects(newProjects);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between gap-4">
        <SearchBar
          searchPlaceholder="Search for a project..."
          onInputChange={onInputChange}
        />
        {role && (role === "ACADEMIC" || role === "ACADEMIC_ADMIN") && (
          <ProjectCreateDialogue onUpdate={getAcademicOwnerProjects} />
        )}
      </div>
      {filteredProjects.length != 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-[2rem] mt-6">
          {filteredProjects.length != 0 &&
            filteredProjects.map((p) => (
              <ProjectCardThumbnail
                key={`project-${p.id}`}
                project={p}
                allowEdit={allowEdit}
                onUpdate={getProjects}
                onError={onError}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
