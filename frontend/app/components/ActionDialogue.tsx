'use client';
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Trash2 as DeleteIcon } from 'lucide-react';
import { Button } from "./ui/button";

/***
 * Simple dialogue for carrying out an action
 * 
 */
const ActionDialogue = ({ title, description, handleAction }:
  {
    title: string,
    description: React.ReactElement | any,
    handleAction: () => void,
  }) => {
  const [openDialogue, setOpenDialogue] = useState<boolean>(false)
  return (
    <Dialog open={openDialogue} onOpenChange={setOpenDialogue}>
      <DialogTrigger asChild>
        <DeleteIcon className="w-4 h-auto hover:text-slate-400" onClick={() => setOpenDialogue(true)} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="column gap-4 p-0 sm:gap-0">
          <Button variant="outline" onClick={() => setOpenDialogue(false)}>Cancel</Button>
          <Button onClick={handleAction}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ActionDialogue;