import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import Modal from "../Modal";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  completeMultipleCourse,
  courseData,
  courseDataParams,
} from "@/app/utils/CourseUtils";
import { Label } from "../ui/label";
import { Filter } from "lucide-react";
import FormNumberedInput from "../form/FormNumberedInput";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "../ui/spinner";
import { useToast } from "../ui/use-toast";

const createProjectSchema = z.object({
  yearFilter: z.coerce.number().positive(),
});

const AddCourse = (props: Props) => {
  const { toast } = useToast();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [yearFilter, setYearFilter] = useState<number>(2023);
  const [selectedCourses, setSelectedCourses] = useState<courseData[]>([]);
  const [shownCourses, setShownCourses] = useState<courseData[]>([]);

  const yearFilterForm = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      yearFilter: 2023,
    },
  });

  const addSelectedCourse = (value: string) => {
    const tmpCourse = shownCourses.find(
      (x) => `${x.code?.toLowerCase()} ${x.title?.toLowerCase()}` === value
    );
    if (!tmpCourse) return;
    setSelectedCourses([...selectedCourses, tmpCourse]);
    const remainingCourses = shownCourses.filter(
      (x) => `${x.code?.toLowerCase()} ${x.title?.toLowerCase()}` !== value
    );
    setShownCourses(remainingCourses);
  };

  const removeSelectedCourse = (value: string) => {
    const tmpCourse = selectedCourses.find(
      (x) => `${x.code?.toLowerCase()} ${x.title?.toLowerCase()}` === value
    );
    if (!tmpCourse) return;
    const remainingCourses = selectedCourses.filter(
      (x) => `${x.code?.toLowerCase()} ${x.title?.toLowerCase()}` !== value
    );
    setSelectedCourses(remainingCourses);
    setShownCourses([...shownCourses, tmpCourse]);
  };

  useEffect(() => {
    const completedCodes = props.completedCourses.map(
      (x) => `${x.code}-${x.year}`
    );
    setShownCourses(
      props.allCourses.filter(
        (x) =>
          x.year === yearFilter.toString() &&
          !completedCodes.includes(`${x.code}-${x.year}`)
      )
    );
    setSelectedCourses([]);
  }, [props.allCourses, props.completedCourses, yearFilter]);

  async function onSubmit() {
    let toAddCourses: courseDataParams[] = selectedCourses.map((c) => {
      return {
        code: c.code ?? "",
        year: c.year ?? "",
      };
    });
    setShowSpinner(true);
    completeMultipleCourse(
      toAddCourses,
      () => {
        setTimeout(() => {
          setShowSpinner(false);
          setSelectedCourses([]);
          props.onSubmit();
        }, 1000);
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

  return (
    <div className="mb-6 sm:mb-0">
      <Dialog
        open={showSpinner ? true : props.isOpen}
        onOpenChange={props.onOpenChange}
      >
        <DialogTrigger className="flex items-center mx-2">
          <Plus className="w-4 h-auto" />
          <div className="font-semibold text-base sm:text-lg">Add Course</div>
        </DialogTrigger>
        <Modal
          isLoading={showSpinner}
          titleChildren={"Add Course"}
          descriptionChildren={"Search for a course you have completed."}
          contentChildren={
            <>
              <Command>
                <div className="w-full gap-6 mb-6 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-2/3">
                    <CommandInput placeholder="Type a command or search..." />
                  </div>
                  <div className="w-full sm:w-1/3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center w-full"
                        >
                          <Filter
                            strokeWidth={1.5}
                            size={18}
                            className="mr-2"
                          />
                          Filter by year
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          <Label htmlFor="year-filter">
                            Year course was completed
                          </Label>
                          <Form {...yearFilterForm}>
                            <form
                              onChange={() => {
                                setYearFilter(
                                  yearFilterForm.getValues("yearFilter")
                                );
                              }}
                              className="space-y-8"
                            >
                              <FormNumberedInput
                                name="yearFilter"
                                id="year-filter"
                                form={yearFilterForm}
                                preventEnter={true}
                              />
                            </form>
                          </Form>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <CommandList className="h-[30rem]">
                  <CommandEmpty>No results found.</CommandEmpty>
                  {selectedCourses.length !== 0 && (
                    <div>
                      <CommandGroup heading="Selected">
                        {selectedCourses.map((c) => {
                          return (
                            <CommandItem
                              value={`${c.code} ${c.title}`}
                              key={`selected-course-${c.id}`}
                              onSelect={removeSelectedCourse}
                              className="flex justify-between w-full hover:cursor-pointer"
                            >
                              {c.code} - {c.title}
                              <X className="w-4 h-auto" />
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      <CommandSeparator />
                    </div>
                  )}
                  <div>
                    <CommandGroup heading="Available">
                      {shownCourses.map((c) => {
                        return (
                          <CommandItem
                            value={`${c.code} ${c.title}`}
                            key={`available-course-${c.id}`}
                            onSelect={addSelectedCourse}
                            className="flex justify-between w-full hover:cursor-pointer"
                          >
                            {c.code} - {c.title}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </div>
                </CommandList>
              </Command>
            </>
          }
          footerChildren={
            <>
              <Button
                variant="outline"
                type="reset"
                onClick={props.onSubmit}
                disabled={showSpinner}
              >
                Cancel
              </Button>
              <Button type="submit" onClick={onSubmit} disabled={showSpinner}>
                {showSpinner ? <Spinner /> : "Add"}
              </Button>
            </>
          }
        />
      </Dialog>
    </div>
  );
};

interface Props {
  allCourses: courseData[];
  completedCourses: courseData[];
  onSubmit: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default AddCourse;
