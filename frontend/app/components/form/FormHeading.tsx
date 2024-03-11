import React from "react";

const FormHeading = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-l font-bold bg-blue-100 my-5 px-5 py-1 dark:bg-blue-100/10">
      {children}
    </h1>
  );
};

export default FormHeading;
