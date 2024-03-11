import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import ProjectCreateForm from './ProjectCreateForm'
import { ScrollArea } from '../ui/scroll-area'
import { Button } from '../ui/button'

const ProjectCreateDialogue = ({ onUpdate }: {
  onUpdate: () => void
}) => {
  const [toggleCreateModal, setToggleCreateModal] = useState<boolean>(false);
  const toggleModal = () => {
    setToggleCreateModal(false);
    onUpdate();
  }
  return (
    <Dialog open={toggleCreateModal} onOpenChange={setToggleCreateModal}>
      <DialogTrigger asChild>
        <Button className="w-fit">Create Project</Button>
      </DialogTrigger>
      <DialogContent className="p-2 sm:[20rem] md:p-6 lg:h-[40rem]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[32rem]">
          <div className="lg:mx-7">
            <ProjectCreateForm onUpdate={toggleModal}/>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectCreateDialogue