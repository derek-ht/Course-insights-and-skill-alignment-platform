"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import AuthVector from "/public/assets/auth_vector.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { authVerify, loginUser } from "../../utils/AuthUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUserData } from "../../utils/UserUtils";
import { useAccessControlContext } from "../../context/accessControl";
import RegisterForm from "./RegisterForm";
import { useToast } from "../ui/use-toast";
import FormTextInput from "../form/FormTextInput";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Please enter your password" }),
});

export type loginParams = z.infer<typeof loginFormSchema>;

const Auth = () => {
  const { setRole } = useAccessControlContext();
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onLogin(values: z.infer<typeof loginFormSchema>) {
    const onSuccess = (res: any) => {
      localStorage.setItem("uID", res.uId);
      fetchUserData(
        (userRes) => setRole(userRes.type),
        (error) => {
          toast({
            variant: "destructive",
            title: "Login Error",
            description: error,
          });
        }
      );
      router.push("/dashboard");
    };
    loginUser(values, onSuccess, (error) => {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error,
      });
    });
  }

  return (
    <>
      <Tabs defaultValue="login" className="h-full w-full">
        <TabsList className="w-full h-9 sm:h-12">
          <TabsTrigger className="w-full text-sm sm:text-xl" value="login">
            Login
          </TabsTrigger>
          <TabsTrigger className="w-full text-sm sm:text-xl" value="register">
            Register
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="max-sm:text-[1.3rem]">Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-s">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)}>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <FormTextInput
                        id="login-email"
                        label="Email"
                        name="email"
                        placeholder="Please enter your email"
                        control={loginForm.control}
                      />
                    </div>
                    <div className="space-y-1">
                      <FormTextInput
                        id="login-password"
                        label="Password"
                        name="password"
                        placeholder="Please enter your password"
                        type="password"
                        control={loginForm.control}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-3 sm:mt-6">
                    Login
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="max-sm:text-[1.3rem]">Register</CardTitle>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Auth;
