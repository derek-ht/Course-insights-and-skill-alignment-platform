import React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Trash2 } from "lucide-react";
import {
  courseData,
  deleteCourse,
  removeCourse,
} from "@/app/utils/CourseUtils";
import { useToast } from "../ui/use-toast";

const CompletedCoursesList = (props: {
  courses: courseData[];
  setCourseDeleted: (isDeleted: boolean) => void;
  role: string;
}) => {
  const { toast } = useToast();
  const router = useRouter();

  const onRemoveCourse = (c: courseData) => {
    if (props.role === "STUDENT") {
      removeCourse(
        { code: c.code ?? "", year: c.year ?? "" },
        () => {
          props.setCourseDeleted(true);
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
        }
      );
    } else {
      deleteCourse(
        { code: c.code ?? "", year: c.year ?? "" },
        () => {
          props.setCourseDeleted(true);
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
        }
      );
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-6 h-full px-4 ">
      <Command className="mt-4 h-full">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="mt-4 h-full max-h-[66vh]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <div className="mt-4 mr-3 h-full">
              {props.courses.map((c: courseData) => {
                return (
                  <CommandItem
                    value={`${c.code} ${c.year} ${c.title}`}
                    key={`completed-course-${c.id}`}
                    className="justify-between p-2 mt-3 rounded-lg hover:cursor-pointer"
                  >
                    <Card
                      className="flex flex-col items-center w-full sm:flex-row"
                      onClick={() => {
                        router.push(`/courses/${c.year}/${c.code}`);
                      }}
                    >
                      <CardHeader className="flex flex-row gap-4 items-start">
                        <CardTitle className="text-lg">{c.code}</CardTitle>
                        <div className="text-sm sm:text-base">{c.year}</div>
                      </CardHeader>
                      <CardContent className="py-0 flex flex-col gap-6 mb-6 h-full items-center justify-between w-full sm:flex-row sm:mb-0">
                        <div className="text-center flex items-center h-full text-sm sm:text-left sm:text-base">
                          {c.title}
                        </div>
                        <Trash2
                          className="w-4 h-auto hover:text-slate-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCourse(c);
                          }}
                        />
                      </CardContent>
                    </Card>
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default CompletedCoursesList;
