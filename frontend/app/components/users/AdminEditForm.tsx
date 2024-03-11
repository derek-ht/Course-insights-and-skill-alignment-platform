import React, { useEffect } from "react";
import FormGrid from "../form/FormGrid";
import FormHeading from "../form/FormHeading";
import FormTextInput from "../form/FormTextInput";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import {
  UserType,
  editAvatar,
  editDegree,
  editEmail,
  editName,
  editPhoneNumber,
  editSchool,
  editType,
  formatUserType,
  userDataType,
} from "../..//utils/UserUtils";
import FormAvatar from "../form/FormAvatar";
import FormMobileInput from "../form/FormMobileInput";
import {
  Dimensions,
  editProfileSchema,
  getImageDimensions,
} from "../../utils/FormValidation";
import { SelectItem } from "../ui/select";
import FormSelect from "../form/FormSelect";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const AdminEditForm = ({ user, setSaved }: {
  user: userDataType,
  setSaved: CallableFunction
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const defaultValues = {
    firstname: user.firstName ?? "",
    lastname: user.lastName ?? "",
    school: user.school ?? "",
    degree: user.degree ?? "",
    phoneNumber: user.phoneNumber ?? "",
    avatar: user.avatar ?? "",
    type: user.type.toString() ?? "",
  };

  const editProfileForm = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    editProfileForm.reset(defaultValues);
  }, [user]);

  // Submit and error functions
  const onSubmit = (values: z.infer<typeof editProfileSchema>) => {
    const onSubmitSuccess = (value: any) => {
      // Admin no longer has perms, redirect to dashboard
      const userId = localStorage.getItem("uID");
      if (userId && userId === user.id && (values.type !== "ADMIN" && values.type !== "ACADEMIC_ADMIN")) {
        router.push("/");
      }
      setSaved(true);
    }
    const onSubmitError = (error: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    };
    const onAvatarSubmitSuccess = (value: any) =>
      editProfileForm.setValue("avatar", value.imagePath);
    const onAvatarSubmitError = (error: string) => {
      editProfileForm.setError("avatar", { type: "custom", message: error });
    };

    // Update field if it has changed
    if (
      values.firstname !== user.firstName ||
      values.lastname !== user.lastName
    )
      editName(
        user.id,
        values.firstname,
        values.lastname,
        onSubmitSuccess,
        onSubmitError
      );
    if (values.school !== user.school) {
      editSchool(user.id, values.school, onSubmitSuccess, onSubmitError);
    }
    if (values.degree !== user.degree) {
      editDegree(user.id, values.degree, onSubmitSuccess, onSubmitError);
    }
    if (values.phoneNumber !== user.phoneNumber) {
      editPhoneNumber(
        user.id,
        values.phoneNumber,
        onSubmitSuccess,
        onSubmitError
      );
    }
    if (values.avatar !== user.avatar) {
      getImageDimensions(values.avatar, (dimensions: Dimensions) =>
        editAvatar(
          user.id,
          values.avatar,
          dimensions.width,
          dimensions.height,
          onAvatarSubmitSuccess,
          onAvatarSubmitError
        )
      );
    }
    if (values.type !== user.type.toString()) {
      editType(user.id, values.type, onSubmitSuccess, onSubmitError);
    }
  };

  return (
    <Form {...editProfileForm}>
      <form className="space-y-8 pl-2 pr-4 lg:p-0 lg:mb-4">
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

          <FormSelect
            id="profile-type"
            label="User Type"
            name="type"
            onChange={editProfileForm.handleSubmit(onSubmit)}
            form={editProfileForm}
            selectContent={typeKeys.map((type) => (
              <SelectItem key={`type-${type}`} value={type}>
                {formatUserType(type)}
              </SelectItem>
            ))}
          />
        </FormGrid>
      </form>
    </Form>
  );
};

const typeKeys = Object.keys(UserType).filter((k) => isNaN(Number(k)));

export default AdminEditForm;
