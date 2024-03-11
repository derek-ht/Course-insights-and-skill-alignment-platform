import React, { useEffect, useState } from 'react'
import { Dialog, DialogTrigger } from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { Pencil } from 'lucide-react';
import Modal from '../Modal';
import ProjectEditForm from './ProjectEditForm';
import { useToast } from '../ui/use-toast';

const ProjectEditDialogue = ({ project, update }: {
  project: any,
  update?: () => void
}) => {
  const { toast } = useToast();
  const [openDialogue, setOpenDialogue] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else if (!openDialogue) {
      update && update();
      // Edit form success message
      if (saveSuccess) {
        toast({
          title: "Changes saved",
          description: `Saved changes to project`,
        });
        setSaveSuccess(false);
      }
    }
    // Reload group feed with updated info when dialogue is closed

  }, [openDialogue, saveSuccess]);

  const handleClick = (e: React.MouseEvent) => {
    e.nativeEvent.stopPropagation();
    setOpenDialogue(true);
  }

  return (
    <Dialog open={openDialogue} onOpenChange={setOpenDialogue}>
      <DialogTrigger asChild>
        <Pencil className="w-4 h-auto hover:text-slate-400" onClick={handleClick} />
      </DialogTrigger>
      <Modal
        titleChildren={`Edit Project ${project.title}`}
        descriptionChildren="Edit Group"
        contentAttr="p-2 pt-6 w-full md:h-[40rem] md:p-6"
        contentChildren={
          <ScrollArea className="h-[32rem]">
            <div className="lg:mx-7">
              <ProjectEditForm project={project} setSaved={setSaveSuccess} />
            </div>
          </ScrollArea>
        }
      />
    </Dialog>
  )
}

export default ProjectEditDialogue;