import React, { useEffect, useState } from "react";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Pencil } from "lucide-react";
import EditGroupForm from "./GroupEditForm";
import { GroupType } from "../../utils/GroupUtils";
import Modal from "../Modal";
import { useToast } from "../ui/use-toast";

const GroupEditDialogue = ({
  group,
  update,
}: {
  group: GroupType;
  update: () => void;
}) => {
  const { toast } = useToast();
  const [openDialogue, setOpenDialogue] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [firstRender, setFirstRender] = useState(true);
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else if (!openDialogue) {
      // Reload group feed with updated info when dialogue is closed
      update();
      if (saveSuccess) {
        toast({
          title: "Changes saved",
          description: `Saved changes to group`,
        });
        setSaveSuccess(false);
      }
    }
  }, [openDialogue, saveSuccess]);

  const handleClick = (e: React.MouseEvent) => {
    setOpenDialogue(true);
  };
  return (
    <Dialog open={openDialogue} onOpenChange={setOpenDialogue}>
      <DialogTrigger asChild>
        <Pencil
          className="w-4 h-auto hover:text-slate-400"
          onClick={handleClick}
        />
      </DialogTrigger>
      <Modal
        titleChildren={`Edit Group ${group.name}`}
        descriptionChildren="Edit Group"
        contentAttr="px-2 pt-4 w-full md:h-[40rem] md:p-6"
        contentChildren={
          <ScrollArea className="h-[32rem]">
            <div className="lg:mx-7">
              <EditGroupForm group={group} setSaved={setSaveSuccess} />
            </div>
          </ScrollArea>
        }
      />
    </Dialog>
  );
};

export default GroupEditDialogue;
