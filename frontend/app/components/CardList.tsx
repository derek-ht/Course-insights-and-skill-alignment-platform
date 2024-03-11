import React from "react";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

type CardListProps = {
  title: string;
  cardList?: React.ReactNode[];
  emptyCardList?: React.ReactNode;
  contentAttr?: string;
  parentDivAttr?: string;
  scrollAreaAttr?: string;
  skeleton?: React.ReactElement | any;
};

const CardList = ({
  title,
  cardList,
  contentAttr,
  parentDivAttr,
  scrollAreaAttr,
  emptyCardList,
  skeleton,
}: CardListProps) => {
  return (
    <div
      className={parentDivAttr ?? "flex mt-7 items-center w-full lg:flex-grow"}
    >
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent
          className={contentAttr ?? "flex justify-around w-full h-[30rem]"}
        >
          {cardList && cardList.length > 0 ? (
            <ScrollArea
              className={scrollAreaAttr ?? "w-full rounded-md border p-4"}
            >
              {cardList?.map((card, idx) => (
                <div key={idx}>
                  {card}
                  <Separator className="mt-6" />
                </div>
              ))}
            </ScrollArea>
          ) : skeleton ? (
            <ScrollArea
              className={scrollAreaAttr ?? "w-full rounded-md border p-4"}
            >
              {skeleton}
            </ScrollArea>
          ) : (
            <div className="flex h-[30rem]">{emptyCardList}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CardList;
