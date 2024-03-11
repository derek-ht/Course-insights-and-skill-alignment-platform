"use client";

import * as z from "zod";
import React, { KeyboardEvent, useState } from "react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import Modal from "../Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { addCourseWeb } from "@/app/utils/CourseUtils";
import FormTextInput from "../form/FormTextInput";
import Spinner from "../ui/spinner";
import { useToast } from "../ui/use-toast";

const addCourseWebFormSchema = z.object({
  url: z.string().min(1, { message: "Course url must not be empty" }),
});

export type addCourseWebParams = z.infer<typeof addCourseWebFormSchema>;
const CourseCreateVLink = (props: Props) => {
  const { toast } = useToast();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const form = useForm<z.infer<typeof addCourseWebFormSchema>>({
    resolver: zodResolver(addCourseWebFormSchema),
    defaultValues: {
      url: "",
    },
  });

  function onSubmit(values: z.infer<typeof addCourseWebFormSchema>) {
    setShowSpinner(true);
    addCourseWeb(
      values,
      () => {
        form.reset();
        setShowSpinner(false);
        props.onSubmit();
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        form.reset();
        setShowSpinner(false);
        props.onSubmit();
      }
    );
  }

  return (
    <Dialog
      open={showSpinner ? true : props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Modal
            isLoading={showSpinner}
            titleChildren={
              <>
                Create Course{" "}
                <span className="font-normal text-base">
                  via Course Page URL
                </span>
              </>
            }
            descriptionChildren={
              "Link the appropriate course page URL found on the official handbook."
            }
            contentChildren={
              <FormTextInput
                id="create-v-link"
                label=""
                name="url"
                placeholder="Enter course page URL"
                onKeyDown={(e: React.KeyboardEvent<Element>) => {
                  if (e.key === "Enter") {
                    form.handleSubmit(onSubmit)();
                  }
                }}
                control={form.control}
                disabled={showSpinner}
              />
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
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={showSpinner}
                >
                  {showSpinner ? <Spinner /> : "Create"}
                </Button>
              </>
            }
          />
        </form>
      </Form>
    </Dialog>
  );
};

interface Props {
  onSubmit: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default CourseCreateVLink;
