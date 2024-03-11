import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";

const Modal = (props: Props) => {
  return (
    <DialogContent
      onInteractOutside={(e) => {
        if (props.isLoading && props.isLoading == true) {
          e.preventDefault();
        }
      }}
      className={props.contentAttr}
      onPointerDownOutside={(e) => props.onPointerDownOutside?.(e)}
    >
      <DialogHeader>
        <DialogTitle>{props.titleChildren}</DialogTitle>
        <DialogDescription>{props.descriptionChildren}</DialogDescription>
      </DialogHeader>
      {props.contentChildren}
      <DialogFooter>{props.footerChildren}</DialogFooter>
    </DialogContent>
  );
};

interface Props {
  titleChildren?: React.ReactElement | any;
  descriptionChildren?: React.ReactElement | any;
  contentChildren?: React.ReactElement | any;
  footerChildren?: React.ReactElement | any;
  contentAttr?: string;
  isLoading?: boolean;
  onPointerDownOutside?: (e: any) => void;
}

export default Modal;
