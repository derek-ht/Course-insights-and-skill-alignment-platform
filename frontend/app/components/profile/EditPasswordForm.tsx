import React, { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { passwordRegex } from "../../utils/FormValidation";
import { Form } from "../ui/form";
import FormHeading from "../form/FormHeading";
import FormGrid from "../form/FormGrid";
import FormTextInput from "../form/FormTextInput";
import { Button } from "../ui/button";
import { editPassword } from "@/app/utils/UserUtils";
import { useToast } from "../ui/use-toast";

const editPasswordSchema = z
  .object({
    password: z.string().regex(passwordRegex, {
      message:
        "Invalid password. Ensure password has minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character",
    }),
    confirm: z
      .string()
      .min(1, { message: "Please make sure your passwords match" }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
      ctx.addIssue({
        code: "custom",
        message: "Please make sure your passwords match",
        path: ["confirm"],
      });
    }
  });

const EditPasswordForm = () => {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const editPasswordForm = useForm<z.infer<typeof editPasswordSchema>>({
    resolver: zodResolver(editPasswordSchema),
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const onSubmit = (values: z.infer<typeof editPasswordSchema>) => {
    const uId = localStorage.getItem("uID");
    if (uId === null) {
      return;
    }
    const onSubmitSuccess = (value: any) => {
      setSuccess(true);
      editPasswordForm.reset();
    };
    const onSubmitError = (error: string) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    };
    editPassword(uId, values.password, onSubmitSuccess, onSubmitError);
  };
  return (
    <Form {...editPasswordForm}>
      <form
        className="space-y-8 pl-2 pr-6 lg:px-10 lg:mb-4"
        onSubmit={editPasswordForm.handleSubmit(onSubmit)}
      >
        <FormHeading>Change Password</FormHeading>
        <FormGrid>
          <FormTextInput
            id="profile-password"
            label="New Password"
            name="password"
            type="password"
            onBlur={() => setSuccess(false)}
            control={editPasswordForm.control}
          />
          <FormTextInput
            id="profile-confirm"
            label="Confirm Password"
            name="confirm"
            type="password"
            onBlur={() => setSuccess(false)}
            control={editPasswordForm.control}
          />
        </FormGrid>

        <div className="flex flex-col justify-center space-y-6">
          {success && (
            <p className="font-bold text-center text-sm">
              Password Changed Successfully
            </p>
          )}
          <Button type="submit">Confirm</Button>
        </div>
      </form>
    </Form>
  );
};

export default EditPasswordForm;
