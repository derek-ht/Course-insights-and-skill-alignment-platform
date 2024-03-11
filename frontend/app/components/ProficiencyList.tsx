import React, { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { WordCloudChart } from "@carbon/charts-react";
import "@carbon/charts-react/styles.css";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { wordCloudData } from "../utils/SummaryUtils";

type proficiencyProps = {
  title: string;
  list?: string[];
  visualData?: wordCloudData[];
};

const TraitList = ({ title, list, visualData }: proficiencyProps) => {
  return (
    <>
      {list && list.length !== 0 && (
        <div className="flex flex-col justify-between mt-7 w-full lg:flex-row">
          <Card className="lg:w-[60%]">
            <CardHeader>
              <CardTitle className="font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around w-full max-h-[18rem]">
              <ScrollArea className="w-full rounded-md border">
                {list?.map((item, idx) => (
                  <div key={idx} className="p-4">
                    {item}
                    {idx !== list.length - 1 && <Separator />}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <div className="flex justify-end mx-2 mt-8 w-[90%] lg:w-[35%] lg:mt-0">
            {visualData && (
              <WordCloudChart
                data={visualData}
                options={{
                  title: "Skills and Knowledge",
                  resizable: true,
                  legend: {
                    enabled: false,
                  },
                  wordCloud: {},
                  height: "20rem",
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TraitList;
