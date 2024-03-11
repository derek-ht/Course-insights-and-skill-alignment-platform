import React, { useEffect } from "react";
import FormGrid from "../form/FormGrid";
import FormHeading from "../form/FormHeading";
import FormTextInput from "../form/FormTextInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import {
  editAvatar,
  editDegree,
  editEmail,
  editName,
  editPhoneNumber,
  editSchool,
} from "../..//utils/UserUtils";
import FormAvatar from "../form/FormAvatar";
import FormMobileInput from "../form/FormMobileInput";
import {
  Dimensions,
  getImageDimensions,
  editProfileSchema,
} from "../../utils/FormValidation";
import { UserProps } from "../types";
import { useToast } from "../ui/use-toast";

const EditProfileForm = ({
  user,
  setSaved,
}: {
  user: UserProps;
  setSaved: CallableFunction;
}) => {
  const { toast } = useToast();
  const defaultValues = {
    firstname: user.firstName ?? "",
    lastname: user.lastName ?? "",
    school: user.school ?? "",
    degree: user.degree ?? "",
    phoneNumber: user.phoneNumber ?? "",
    avatar: user.avatar ?? "",
    type: user.type?.toString() ?? "",
  };

  const editProfileForm = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    editProfileForm.reset(defaultValues);
  }, [user]);

  const onSubmit = (values: z.infer<typeof editProfileSchema>) => {
    const uId = localStorage.getItem("uID");
    if (uId === null) return;

    // Submit and error functions
    const onSubmitSuccess = (value: any) => {
      setSaved(true);
    };

    const onSubmitError = (error: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    };

    const onAvatarSubmitSuccess = (value: any) => {
      editProfileForm.setValue("avatar", value.imagePath);
      onSubmitSuccess(value);
    };

    const onAvatarSubmitError = (error: string) => {
      editProfileForm.setError("avatar", { type: "custom", message: error });
    };

    // Update field only if field has been changed
    if (
      values.firstname !== user.firstName ||
      values.lastname !== user.lastName
    ) {
      editName(
        uId,
        values.firstname,
        values.lastname,
        onSubmitSuccess,
        onSubmitError
      );
    }
    if (values.school !== user.school) {
      editSchool(uId, values.school, onSubmitSuccess, onSubmitError);
    }
    if (values.degree !== user.degree) {
      editDegree(uId, values.degree, onSubmitSuccess, onSubmitError);
    }
    if (values.phoneNumber !== user.phoneNumber) {
      editPhoneNumber(uId, values.phoneNumber, onSubmitSuccess, onSubmitError);
    }
    if (values.avatar !== user.avatar) {
      getImageDimensions(values.avatar, (dimensions: Dimensions) =>
        editAvatar(
          uId,
          values.avatar,
          dimensions.width,
          dimensions.height,
          onAvatarSubmitSuccess,
          onAvatarSubmitError
        )
      );
    }
  };

  return (
    <Form {...editProfileForm}>
      <form className="space-y-8 pl-2 pr-6 lg:px-10 lg:mb-4">
        <FormHeading>Profile Avatar</FormHeading>
        <FormAvatar
          form={editProfileForm}
          name="avatar"
          id="profile-avatar-url"
          onBlur={editProfileForm.handleSubmit(onSubmit)}
        />
        <FormHeading>Basic Profile</FormHeading>
        <FormGrid>
          <FormTextInput
            id="profile-firstname"
            label="First Name"
            name="firstname"
            onBlur={editProfileForm.handleSubmit(onSubmit)}
            control={editProfileForm.control}
          />
          <FormTextInput
            id="profile-lastname"
            label="Last Name"
            name="lastname"
            onBlur={editProfileForm.handleSubmit(onSubmit)}
            control={editProfileForm.control}
          />
          <FormMobileInput
            id="profile-mobile"
            label="Phone Number"
            name="phoneNumber"
            placeholder="0412345678"
            onBlur={editProfileForm.handleSubmit(onSubmit)}
            form={editProfileForm}
          />
        </FormGrid>
        <FormHeading>University Profile</FormHeading>

        <FormGrid>
          <FormTextInput
            id="profile-school"
            label="School"
            name="school"
            onBlur={editProfileForm.handleSubmit(onSubmit)}
            control={editProfileForm.control}
          />
          <FormTextInput
            id="profile-degree"
            label="Degree"
            name="degree"
            onBlur={editProfileForm.handleSubmit(onSubmit)}
            control={editProfileForm.control}
          />
        </FormGrid>
      </form>
    </Form>
  );
};

export default EditProfileForm;
