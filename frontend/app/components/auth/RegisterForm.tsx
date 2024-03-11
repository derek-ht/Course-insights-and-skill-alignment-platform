"use client";
import React, { useState } from "react";
import RegisterFormInitial from "./RegisterFormInitial";
import RegisterConfirmation from "./RegisterConfirmation";

const RegisterForm = () => {
  const [registerStage, setRegisterStage] = useState("Initial");
  const [email, setEmail] = useState("");

  const registerStageCallback = (
    stage: "Initial" | "Confirmation",
    email: string
  ) => {
    setRegisterStage(stage);
    setEmail(email);
  };

  return (
    <>
      {registerStage === "Initial" && (
        <RegisterFormInitial stageCallback={registerStageCallback} />
      )}
      {registerStage === "Confirmation" && (
        <RegisterConfirmation email={email} />
      )}
    </>
  );
};

export default RegisterForm;
