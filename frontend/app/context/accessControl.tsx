// app/context/theme.js

"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AccessControlType } from "./accessControlType";

const AccessControlContext = createContext<AccessControlType>({
  role: "",
  setRole: () => {},
});

export const AccessControlContextProvider = (props: Props) => {
  const [role, setRole] = useState("");

  return (
    <AccessControlContext.Provider value={{ role, setRole }}>
      {props.children}
    </AccessControlContext.Provider>
  );
};

interface Props {
  children?: ReactNode;
}

export const useAccessControlContext = () => useContext(AccessControlContext);
