import { tobase64Handler } from "@/app/utils/FileFormatter";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import Modal from "../Modal";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "../ui/form";
import { addCoursePdf } from "@/app/utils/CourseUtils";
import Spinner from "../ui/spinner";
import { useToast } from "../ui/use-toast";

const addCoursePdfFormSchema = z.object({
  file: z.any(),
});

export type addCoursePdfParams = z.infer<typeof addCoursePdfFormSchema>;
const CourseCreateVPdf = (props: Props) => {
  const { toast } = useToast();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [files, setFiles] = useState<string[]>([]);
  const form = useForm<z.infer<typeof addCoursePdfFormSchema>>({
    resolver: zodResolver(addCoursePdfFormSchema),
    defaultValues: {
      file: "",
    },
  });

  function onSubmit() {
    const params: addCoursePdfParams = { file: files[0] };
    setShowSpinner(true);
    addCoursePdf(
      params,
      async () => {
        await new Promise(() =>
          setTimeout(() => {
            form.reset();
            setShowSpinner(false);
            props.onSubmit();
          }, 1500)
        );
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
                <span className="font-normal text-base">via PDF File</span>
              </>
            }
            descriptionChildren={
              <>
                Create a course by providing a <b>.pdf</b> file of the course.
              </>
            }
            contentChildren={
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="my-2"
                        id="picture"
                        type="file"
                        accept=".pdf"
                        {...field}
                        onChange={async (event) => {
                          if (!event.target.files) {
                            return;
                          }
                          field.onChange(event.target.value);
                          setFiles(await tobase64Handler(event.target.files));
                        }}
                        disabled={showSpinner}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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

export default CourseCreateVPdf;
