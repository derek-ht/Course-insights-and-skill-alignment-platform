import React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormGrid from "../form/FormGrid";
import FormTextInput from "../form/FormTextInput";
import { Form, FormLabel } from "../ui/form";
import FormTextArea from "../form/FormTextArea";
import { Button } from "../ui/button";
import FormNumberedInput from "../form/FormNumberedInput";
import FormHeading from "../form/FormHeading";
import { createGroup } from "@/app/utils/GroupUtils";
import { useToast } from "../ui/use-toast";

const createGroupSchema = z.object({
  name: z.string().min(1, { message: "Please enter a group name" }),
  description: z.string(),
  size: z.number().positive(),
});

const GroupCreateForm = ({ onUpdate }: { onUpdate: () => void }) => {
  const { toast } = useToast();
  const createForm = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createGroupSchema>) => {
    createGroup(
      values.name,
      values.description,
      values.size,
      () => onUpdate(),
      (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    );
  };
  return (
    <Form {...createForm}>
      <form
        onSubmit={createForm.handleSubmit(onSubmit)}
        className="space-y-8">
        <FormHeading>Create Group</FormHeading>
        <FormGrid>
          <FormTextInput
            id="group-name"
            label="Group Name"
            name="name"
            placeholder="Please enter a group name"
            control={createForm.control}
          />
          <FormTextArea
            id="group-description"
            label="Description"
            name="description"
            placeholder="Please enter a group description"
            control={createForm.control}
          />

          <FormLabel>Group Size</FormLabel>
          <FormNumberedInput name="size" id="group-size" form={createForm} />
        </FormGrid>
        <div className="flex justify-center">
          <Button type="submit">Create Group</Button>
        </div>
      </form>
    </Form>
  );
};

export default GroupCreateForm;
