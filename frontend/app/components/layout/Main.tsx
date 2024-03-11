import React from "react";

const Main = ({ children }: { children: React.ReactNode }) => {
  return <main className="my-12 w-11/12 max-w-[80rem]">{children}</main>;
};

export default Main;
