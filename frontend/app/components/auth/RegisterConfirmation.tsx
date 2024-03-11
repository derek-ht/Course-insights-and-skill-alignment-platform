import { Mail } from "lucide-react";
import React from "react";

type RegisterConfirmationProps = {
  email: string;
};

const RegisterConfirmation = ({ email }: RegisterConfirmationProps) => {
  return (
    <div className="flex flex-col justify-center items-center text-center">
      <Mail />
      <p className="font-bold">Please verify your email</p>
      <p>
        We sent an email to <b>{email}</b>
      </p>
      <p>Click on the link in the email we sent you to verify your account.</p>
      <p>If you can't find it, check your spam folder.</p>
    </div>
  );
};

export default RegisterConfirmation;
