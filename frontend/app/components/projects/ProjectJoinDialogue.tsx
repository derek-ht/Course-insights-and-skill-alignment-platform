import React, { useEffect, useState } from 'react'
import { Dialog, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import Modal from '../Modal';
import { GroupType, joinProject } from '../../utils/GroupUtils';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { ProjectType, joinableGroups } from '../../utils/ProjectUtils';
import { useToast } from "../../components/ui/use-toast";

const ProjectJoinDialogue = ({ project, groups, update }: {
  project: ProjectType,
  groups: GroupType[]
  update: () => void
}) => {
  const [toggleModal, setToggleModal] = useState<boolean>(false);
  const { toast } = useToast();

  const onError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error,
    });
  }

  const handleJoinProject = (group: GroupType) => {
    const handleJoinSuccess = (res: any) => {
      setToggleModal(false);
      update();
    }

    joinProject(group.id, project.id, handleJoinSuccess, onError
    );
  }

  return (
    <Dialog
      open={toggleModal}
      onOpenChange={setToggleModal}
    >
      <DialogTrigger asChild>
        <Button type="button" className="h-full lg:h-fit">
          Join Project
        </Button>
      </DialogTrigger>
      <Modal
        titleChildren="Join Project"
        contentAttr='w-[50rem]'
        contentChildren={
          <ScrollArea className="max-h-[30rem] text-center">
            {(groups.length > 0) ?
              <>
                Choose a group you are in to join project
                <p className="font-bold">{project.title}</p>
              </> :
              <>
                <p className="mb-2 font-bold">No groups you are in are available to join this project.</p>
                <p className="mb-2">Join a group or check you have a full group and
                  the number of members in your group meets the project size restrictions.</p>
              </>
            }

            <div className='grid grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] gap-8 my-4 mx-8'>
              {groups?.length > 0 && groups.map((g) =>
                <div
                  key={`${g.id}`}
                  className={`rounded-md ${hoverTransition}`}
                  onClick={() => handleJoinProject(g)}
                >
                  <p className="text-center font-bold">{g.name}</p>
                  <Image
                    width={500}
                    height={500}
                    src={g.coverPhoto}
                    alt={`Group ${g.id} cover photo`}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        }
      />
    </Dialog>
  )
}

const hoverTransition = "rounded transition ease-in-out delay-15 box-border hover:shadow-[0_0_1px_8px] hover:shadow-slate-100 cursor-pointer";

export default ProjectJoinDialogue;