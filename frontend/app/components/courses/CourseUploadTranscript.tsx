import { tobase64Handler } from "@/app/utils/FileFormatter";
import { FileUp } from "lucide-react";
import React, { useState } from "react";
import Modal from "../Modal";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

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
import {
  uploadTranscript,
  uploadTranscriptParams,
} from "@/app/utils/CourseUtils";
import Spinner from "../ui/spinner";
import { useToast } from "../ui/use-toast";

const uploadTranscriptFormSchema = z.object({
  file: z.any(),
});

export type addCoursePdfParams = z.infer<typeof uploadTranscriptFormSchema>;
const CourseUploadTranscript = (props: Props) => {
  const { toast } = useToast();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [files, setFiles] = useState<string[]>([]);
  const form = useForm<z.infer<typeof uploadTranscriptFormSchema>>({
    resolver: zodResolver(uploadTranscriptFormSchema),
    defaultValues: {
      file: "",
    },
  });

  function onSubmit() {
    const params: uploadTranscriptParams = {
      file: files[0],
      uId: localStorage.getItem("uID") ?? "",
    };
    setShowSpinner(true);
    uploadTranscript(
      params,
      async () => {
        await new Promise(() =>
          setTimeout(() => {
            form.reset();
            setShowSpinner(false);
            props.onSubmit();
          }, 2000)
        );
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
    <Dialog
      open={showSpinner ? true : props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <DialogTrigger className="flex items-center mx-2">
        <FileUp className="w-4 h-auto" />
        <p className="font-semibold text-base sm:text-lg">Upload Transcript</p>
      </DialogTrigger>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Modal
            isLoading={showSpinner}
            titleChildren={"Upload Transcript"}
            descriptionChildren={
              <>
                Attach a <b>.pdf</b> file of your academic transcript/statement.
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
                        multiple={true}
                        onChange={async (event) => {
                          if (!event.target.files) {
                            return;
                          }
                          field.onChange(event.target.value);
                          setFiles(await tobase64Handler(event.target.files));
                        }}
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
                  {showSpinner ? <Spinner /> : "Upload"}
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

export default CourseUploadTranscript;
