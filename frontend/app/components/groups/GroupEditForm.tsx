import React, { useEffect } from "react";
import FormGrid from "../form/FormGrid";
import FormHeading from "../form/FormHeading";
import FormTextInput from "../form/FormTextInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormLabel } from "../ui/form";
import FormTextArea from "../form/FormTextArea";
import FormNumberedInput from "../form/FormNumberedInput";
import FormImage from "../form/FormImage";
import {
  GroupType,
  editGroupName,
  editGroupCoverPhoto,
  editGroupDescription,
  editGroupSize,
} from "../../utils/GroupUtils";
import { Dimensions, editGroupSchema, getImageDimensions } from "@/app/utils/FormValidation";
import { useToast } from "../ui/use-toast";

const EditGroupForm = ({ group, setSaved }: {
  group: GroupType,
  setSaved: CallableFunction
}) => {
  const { toast } = useToast();
  const defaultValues = {
    name: group.name ?? "",
    description: group.description ?? "",
    size: group.size ?? 1,
    coverPhoto: group.coverPhoto ?? "",
  };

  const editGroupForm = useForm<z.infer<typeof editGroupSchema>>({
    resolver: zodResolver(editGroupSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    editGroupForm.reset(defaultValues);
  }, [group]);

  const onSubmit = (values: z.infer<typeof editGroupSchema>) => {
    const uId = localStorage.getItem("uID");
    if (uId == null) return;

    // Success and Error Functions
    const onSuccess = () => setSaved(true);
    const onError = (error: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    };
    const onPhotoSubmitSuccess = (value: any) =>
      editGroupForm.setValue("coverPhoto", value.imagePath);
    const onPhotoSubmitError = (error: string) =>
      editGroupForm.setError("coverPhoto", { type: "custom", message: error });
    const onSizeSubmitError = (error: string) =>
      editGroupForm.setError("size", { type: "custom", message: error });

    // Update edit fields if changed
    if (values.name !== group.name) {
      editGroupName(group.id, values.name, onSuccess, onError);
    }
    if (values.description !== group.description) {
      editGroupDescription(group.id, values.description, onSuccess, onError);
    }
    if (values.size !== group.size) {
      editGroupSize(group.id, values.size, onSuccess, onSizeSubmitError);
    }
    if (values.coverPhoto !== group.coverPhoto) {
      getImageDimensions(values.coverPhoto, (dimensions: Dimensions) => {
        editGroupCoverPhoto(
          group.id,
          values.coverPhoto,
          dimensions.width,
          dimensions.height,
          onPhotoSubmitSuccess,
          onPhotoSubmitError
        );
      });
    }
  };

  return (
    <Form {...editGroupForm}>
      <form className="space-y-8 pl-2 pr-4 lg:p-0 lg:mb-4">
        <FormHeading>Group Cover Photo</FormHeading>
        <FormImage
          label="Group Cover Photo URL"
          form={editGroupForm}
          name="coverPhoto"
          id="group-photo"
          altText="Group Cover Photo"
          onBlur={editGroupForm.handleSubmit(onSubmit)}
        />
        <FormHeading>Edit Group</FormHeading>
        <FormGrid>
          <FormTextInput
            id="group-name"
            label="Group Name"
            name="name"
            onBlur={editGroupForm.handleSubmit(onSubmit)}
            control={editGroupForm.control}
          />
          <FormTextArea
            id="group-description"
            label="Group Description"
            name="description"
            placeholder="Enter description"
            onBlur={editGroupForm.handleSubmit(onSubmit)}
            control={editGroupForm.control}
          />
          <FormLabel>Group Size</FormLabel>
          <FormNumberedInput
            name="size"
            id="group-size"
            onBlur={editGroupForm.handleSubmit(onSubmit)}
            form={editGroupForm}
          />
        </FormGrid>
      </form>
    </Form>
  );
};

export default EditGroupForm;
