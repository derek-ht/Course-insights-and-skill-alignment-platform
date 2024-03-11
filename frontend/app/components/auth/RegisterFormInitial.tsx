"use client";
import React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { registerUser } from "../../utils/AuthUtils";
import { Button } from "../ui/button";
import FormTextInput from "../form/FormTextInput";
import { useToast } from "../ui/use-toast";

const nameRegex = new RegExp("^[a-z ,.'-]+$", "i");

const passwordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&'])[A-Za-z\\d@$!%*?&]{8,}$"
);

const registerFormSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    firstName: z.string().regex(nameRegex, { message: "Invalid name" }),
    lastName: z.string().regex(nameRegex, { message: "Invalid name" }),
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

export type registerParams = z.infer<typeof registerFormSchema>;

interface RegisterFormInitialProps {
  stageCallback: (stage: "Initial" | "Confirmation", email: string) => void;
}

const RegisterFormInitial = ({ stageCallback }: RegisterFormInitialProps) => {
  const { toast } = useToast();

  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirm: "",
    },
  });

  function onRegister(values: z.infer<typeof registerFormSchema>) {
    const onSuccess = () => {
      stageCallback("Confirmation", values.email);
    };
    registerUser(values, onSuccess, (error) => {
      toast({
        variant: "destructive",
        title: "Register Error",
        description: error,
      });
    });
  }

  return (
    <Form {...registerForm}>
      <form onSubmit={registerForm.handleSubmit(onRegister)}>
        <div className="space-y-2">
          <div className="space-y-1">
            <FormTextInput
              id="register-firstName"
              label="First Name"
              name="firstName"
              placeholder="Please enter your first name"
              control={registerForm.control}
            />
          </div>
          <div className="space-y-1">
            <FormTextInput
              id="register-lastName"
              label="Last Name"
              name="lastName"
              placeholder="Please enter your last name"
              control={registerForm.control}
            />
          </div>
          <div className="space-y-1">
            <FormTextInput
              id="register-email"
              label="Email"
              name="email"
              placeholder="Please enter your email"
              control={registerForm.control}
            />
          </div>
          <div className="space-y-1">
            <FormTextInput
              id="register-password"
              label="Password"
              name="password"
              type="password"
              placeholder="Please enter your password"
              control={registerForm.control}
            />
          </div>
          <div className="space-y-1">
            <FormTextInput
              id="register-confirm"
              label="Confirm Password"
              name="confirm"
              type="password"
              placeholder="Please enter your password again"
              control={registerForm.control}
            />
          </div>
        </div>
        <Button type="submit" className="mt-3 sm:mt-6">
          Register
        </Button>
      </form>
    </Form>
  );
};

export default RegisterFormInitial;
