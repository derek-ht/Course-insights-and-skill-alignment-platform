import React from "react";
import { Loader2 } from "lucide-react";

const Spinner = (props: { props?: string }) => {
  return (
    <div>
      <Loader2
        className={"text-gray-500 animate-spin" + (props.props ?? "")}
        strokeWidth="2.25"
      />
    </div>
  );
};

export default Spinner;
