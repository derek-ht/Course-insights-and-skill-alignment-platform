import React from "react";
import CardThumbnail from "../CardThumbnail";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import ActionDialogue from "../ActionDialogue";
import { deleteProject } from "@/app/utils/ProjectUtils";
import ProjectEditDialogue from "./ProjectEditDialogue";

const ProjectCardThumbnail = ({
  project,
  allowEdit,
  onUpdate,
  onError,
}: {
  project: any;
  allowEdit?: boolean;
  onUpdate?: () => void;
  onError?: (error: string) => void;
}) => {
  const router = useRouter();

  const handleDelete = () => {
    deleteProject(
      project.id,
      (res: any) => onUpdate && onUpdate(),
      (error) => onError && onError(error)
    );
  };

  return (
    <CardThumbnail
      title={
        <div className="flex justify-between">
          {project.title}
          <div className="flex space-x-4" onClick={(e) => e.stopPropagation()}>
            {allowEdit && (
              <>
                <ProjectEditDialogue project={project} update={onUpdate} />
                <ActionDialogue
                  title="Delete Project"
                  description={
                    <>
                      Are you sure you want to delete project{" "}
                      <b>{project.title}</b>
                    </>
                  }
                  handleAction={handleDelete}
                />
              </>
            )}
          </div>
        </div>
      }
      description={project.description}
      imgAttr="w-full h-[15rem] mb-2 object-cover"
      onClick={() => router.push(`/projects/${project.id}`)}
      imgSrc={project.coverPhoto}
      content={
        <div className="flex gap-2 mb-4 max-h-[1.5rem] flex-wrap overflow-hidden">
          {project.topics.slice(0, 3).map((t: any, index: any) => (
            <Badge key={`badge-${index}`} className="max-w-[7rem] min-w-[3rem]">
              <p className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                {t}
              </p>
            </Badge>
          ))}
          {project.topics.length > 3 && (
            <Badge className="max-w-[7rem] min-w-[3rem]">
              <p className="overflow-ellipsis whitespace-nowrap overflow-hidden">
                + {project.topics.length - 3} more
              </p>
            </Badge>
          )}
        </div>
      }
      imgAlt={`Project ${project.name} cover photo`}
    />
  );
};

export default ProjectCardThumbnail;
