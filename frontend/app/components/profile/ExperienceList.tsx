import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/input";

type ExperienceProps = {
  experienceTitle: string;
  experienceType: string;
  experiences?: string[];
};

const ExperienceList = ({
  experienceProps,
  isAuthUser,
  onAdd,
  onEdit,
  onDelete,
}: {
  experienceProps: ExperienceProps;
  isAuthUser: boolean;
  onAdd: (experience: string) => void;
  onEdit: (oldExperience: string, newExperience: string) => void;
  onDelete: (experience: string) => void;
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addedExperience, setAddedExperience] = useState<string>("");
  const [editingExperience, setEditingExperience] = useState<string>("");
  const [editedExperience, setEditedExperience] = useState<string>("");

  const handleAdd = () => {
    setIsAdding(false);
    if (addedExperience !== "") {
      onAdd(addedExperience);
      setAddedExperience("");
    }
  };
  const handleEdit = () => {
    if (editingExperience !== "" && editedExperience !== "") {
      onEdit(editingExperience, editedExperience);
    }
    setEditingExperience("");
    setEditedExperience("");
  };
  return (
    <Card className="mt-7 w-full">
      <CardHeader>
        <CardTitle className="font-bold">
          {experienceProps.experienceTitle}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="w-full grid lg:grid-cols-2">
        {experienceProps.experiences &&
          experienceProps.experiences.map((experience, idx) => (
            <div key={idx} className="p-2">
              <Card className="flex items-center">
                {editingExperience !== experience ? (
                  <CardContent className="flex w-full p-4 items-center justify-between">
                    {experience}
                    {isAuthUser && (
                      <div className="flex space-x-2">
                        <Pencil
                          className="w-4 h-4 hover:text-slate-400"
                          onClick={() => setEditingExperience(experience)}
                        />
                        <Trash2
                          className="w-4 h-4 hover:text-slate-400"
                          onClick={() => onDelete(experience)}
                        />
                      </div>
                    )}
                  </CardContent>
                ) : (
                  <Input
                    className="hover:text-slate-500"
                    value={editedExperience}
                    onBlur={handleEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEdit();
                      }
                    }}
                    autoFocus
                    onChange={(e) => setEditedExperience(e.target.value)}
                  />
                )}
              </Card>
            </div>
          ))}
        <div className="p-2">
          {isAuthUser && (
            <Card
              className="flex items-center bg-slate-300 hover:cursor-pointer rounded transition ease-in-out delay-15 box-border hover:bg-slate-500 hover:text-slate-50 backdrop:cursor-pointer"
              onClick={() => setIsAdding(true)}
            >
              {isAdding ? (
                <Input
                  className="hover:text-slate-500"
                  value={addedExperience}
                  onBlur={handleAdd}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAdd();
                    }
                  }}
                  autoFocus
                  onChange={(e) => setAddedExperience(e.target.value)}
                />
              ) : (
                <CardContent
                  className="p-4 font-bold flex items-center"
                  onClick={handleAdd}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add{" "}
                  {experienceProps.experienceType}
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperienceList;
