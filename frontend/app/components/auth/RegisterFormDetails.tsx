"use client";
import React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { registerDetails } from "@/app/utils/AuthUtils";
import { phoneRegex } from "@/app/utils/FormValidation";
import FormTextInput from "../form/FormTextInput";
import { useToast } from "../ui/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

const registerDetailsFormSchema = z.object({
  phoneNumber: z.string().regex(phoneRegex, "Invalid phone number").optional(),
  school: z.string().optional(),
  degree: z.string().optional(),
});

export type registerDetailsParams = z.infer<typeof registerDetailsFormSchema>;

const RegisterFormDetails = () => {
  const { toast } = useToast();
  const router = useRouter();

  const registerDetailsForm = useForm<
    z.infer<typeof registerDetailsFormSchema>
  >({
    resolver: zodResolver(registerDetailsFormSchema),
    defaultValues: {
      phoneNumber: "",
      school: "",
      degree: "",
    },
  });

  function onRegisterDetails(
    values: z.infer<typeof registerDetailsFormSchema>
  ) {
    const onSuccess = () => {
      router.push("/dashboard");
    };
    registerDetails(values, onSuccess, (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    });
  }

  return (
    <Card className="w-full h-auto">
      <CardHeader>
        <CardTitle>Getting to know you</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...registerDetailsForm}>
          <form onSubmit={registerDetailsForm.handleSubmit(onRegisterDetails)}>
            <div className="space-y-2">
              <div className="space-y-1">
                <FormTextInput
                  id="register-phoneNumber"
                  label="Phone number"
                  name="phoneNumber"
                  placeholder="Please enter your phone number"
                  control={registerDetailsForm.control}
                />
              </div>
              <div className="space-y-1">
                <FormTextInput
                  id="register-school"
                  label="School"
                  name="school"
                  placeholder="Please enter your school"
                  control={registerDetailsForm.control}
                />
              </div>
              <div className="space-y-1">
                <FormTextInput
                  id="register-degree"
                  label="Degree"
                  name="degree"
                  placeholder="Please enter your degree"
                  control={registerDetailsForm.control}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button
                variant={"secondary"}
                onClick={() => router.push("/dashboard")}
              >
                Skip for now
              </Button>
              <Button type="submit" className="ml-2">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegisterFormDetails;
