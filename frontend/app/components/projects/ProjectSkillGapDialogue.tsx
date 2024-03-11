import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import Modal from "../Modal";
import { GroupType, joinProject } from "../../utils/GroupUtils";
import { ScrollArea } from "../ui/scroll-area";
import { fetchUserData } from "@/app/utils/UserUtils";
import Image from "next/image";
import { ProjectType, getGroupProjectSkillgap } from "@/app/utils/ProjectUtils";
import Spinner from "../ui/spinner";
import { useToast } from "../ui/use-toast";
import { Separator } from "../ui/separator";
import { ArrowLeft } from "lucide-react";

const ProjectSkillGapDialogue = ({
  project,
  update,
  groups,
}: {
  project: ProjectType;
  update: () => void;
  groups: GroupType[];
}) => {
  const { toast } = useToast();
  const [toggleModal, setToggleModal] = useState<boolean>(false);
  const [selectGroup, setSelectGroup] = useState<boolean>(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [skills, setSkills] = useState<string[]>([]);

  const generateSkillGapReport = (group: GroupType) => {
    setShowSpinner(true);
    getGroupProjectSkillgap(
      group.id,
      project.id,
      (res: any) => {
        setSelectGroup(false);
        setSkills(res.requirements);
        setShowSpinner(false);
      },
      (error: string) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    );
  };

  useEffect(() => {
    setSkills([]);
    setSelectGroup(true);
  }, [toggleModal]);

  return (
    <Dialog
      open={showSpinner ? true : toggleModal}
      onOpenChange={setToggleModal}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="h-full lg:h-fit">
          Generate Skill Report
        </Button>
      </DialogTrigger>
      <Modal
        isLoading={showSpinner}
        titleChildren="Generate Skill Report"
        contentAttr="w-[50rem]"
        descriptionChildren={
          selectGroup
            ? showSpinner
              ? "Generating skill gap report..."
              : groups?.length != 0 &&
                "Choose a group to create a skill gap analysis report"
            : "Listed below are the missing skills of the selected group"
        }
        contentChildren={
          <ScrollArea className="max-h-[30rem] text-center">
            {selectGroup ? (
              groups?.length == 0 ? (
                <>
                  <p className="mb-2 font-bold">
                    No groups you are in are available for skill report
                    generation.
                  </p>
                  <p className="mb-2">
                    Join a group or check the number of members in your group
                    meets the project size restriction.
                  </p>
                </>
              ) : showSpinner ? (
                <div className="w-full h-10 flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] gap-8 my-4 mx-8">
                  {groups?.length > 0 &&
                    groups.map((g) => (
                      <div
                        key={`${g.id}`}
                        className={`rounded-md ${hoverTransition}`}
                        onClick={() => generateSkillGapReport(g)}
                      >
                        <p className="text-center font-bold">{g.name}</p>
                        <Image
                          width={500}
                          height={500}
                          src={g.coverPhoto}
                          alt={`Group ${g.id} cover photo`}
                        />
                      </div>
                    ))}
                </div>
              )
            ) : (
              <>
                {skills.length == 0 ? (
                  <div>Skills of group match project</div>
                ) : (
                  skills?.map((item, idx) => (
                    <div key={idx} className="pt-4">
                      <div className="flex align-center">
                        {idx == 0 && (
                          <ArrowLeft
                            className="hover:text-slate-400 hover:cursor-pointer place-self-start"
                            strokeWidth={1.5}
                            onClick={() => {
                              setSkills([]);
                              setSelectGroup(true);
                            }}
                          />
                        )}
                        <div
                          className={
                            "flex w-full justify-center" +
                            (idx == 0 ? " pr-5" : "")
                          }
                        >
                          {item}
                        </div>
                      </div>
                      {idx !== skills.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </ScrollArea>
        }
      />
    </Dialog>
  );
};

const hoverTransition =
  "rounded transition ease-in-out delay-15 box-border hover:shadow-[0_0_1px_8px] hover:shadow-slate-100 cursor-pointer";

export default ProjectSkillGapDialogue;
