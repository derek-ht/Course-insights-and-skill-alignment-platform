import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const BasicCard = (props: Props) => {
  const hover = props.hover ? hoverTransition : ""
  return (
    <Card
      className={hover + " " + props.cardAttr}
      onClick={() => props.onClick && props.onClick()}
    >
      <CardHeader className={props.headerAttr}>
        <CardTitle
          className={"overflow-ellipsis whitespace-nowrap overflow-hidden " + props.titleAttr}>
          {props.titleChildren}
        </CardTitle>
        <CardDescription>{props.descriptionChildren}</CardDescription>
      </CardHeader>
      <CardContent className={props.contentAttr}>
        {props.contentChildren}
      </CardContent>
    </Card>
  )
};

const hoverTransition =
  "rounded transition ease-in-out delay-15 box-border hover:shadow-[0_0_1px_8px] hover:shadow-slate-100 cursor-pointer";

interface Props {
  titleChildren?: React.ReactElement | any;
  descriptionChildren?: React.ReactElement | any;
  contentChildren?: React.ReactElement | any;
  footerChildren?: React.ReactElement | any;
  headerAttr?: string,
  contentAttr?: string;
  titleAttr?: string;
  cardAttr?: string;
  onClick?: CallableFunction,
  hover?: boolean
};

export default BasicCard;