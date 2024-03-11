import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

/** A Card containing a singular image
 *
 * @returns
 */
const CardThumbnail = ({
  headerAttr,
  footerAttr,
  title,
  description,
  content,
  footer,
  imgSrc,
  imgAlt,
  imgAttr,
  noHover,
  onClick,
}: {
  headerAttr?: React.ReactElement | any;
  footerAttr?: React.ReactElement | any;
  title?: React.ReactElement | any;
  description?: React.ReactElement | any;
  content?: React.ReactElement | any;
  footer?: React.ReactElement | any;
  imgSrc?: string;
  imgAlt: string;
  imgAttr?: string;
  noHover?: boolean;
  onClick?: (e: any) => void;
}) => {
  imgSrc = imgSrc ? imgSrc : DEFAULT_IMG;
  imgAttr = imgAttr ? imgAttr : "w-full h-[10rem] object-cover";
  const hover = noHover ? "" : hoverTransition;
  return (
    <Card
      className={hover + " flex flex-col justify-between"}
      onClick={onClick}
    >
      <CardHeader className={headerAttr}>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="overflow-ellipsis whitespace-nowrap overflow-hidden">
          {description.substring(0, 100)}
          {description.length >= 100 && "..."}
        </CardDescription>
      </CardHeader>
      <div>
        <CardContent>
          {content}
          <img
            alt={imgAlt}
            className={imgAttr}
            src={imgSrc}
            onClick={onClick}
          />
        </CardContent>
        {footer && (
          <CardFooter className={footerAttr} onClick={onClick}>
            {footer}
          </CardFooter>
        )}
      </div>
    </Card>
  );
};

const hoverTransition =
  "rounded transition ease-in-out delay-15 box-border hover:shadow-[0_0_1px_8px] hover:shadow-slate-100 cursor-pointer";
const DEFAULT_IMG = "/assets/defaultGroup.jpg";

export default CardThumbnail;
