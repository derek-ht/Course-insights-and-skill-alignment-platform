"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/nav/Navbar";
import {
  fetchCourseData,
  courseData,
  fetchCourses,
  fetchCourseVisualData,
} from "@/app/utils/CourseUtils";
import { Label } from "@/app/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/app/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio";
import { ArrowLeft } from "lucide-react";
import { WordCloudChart } from "@carbon/charts-react";
import "@carbon/charts-react/styles.css";
import { wordCloudData } from "@/app/utils/SummaryUtils";
import { useToast } from "@/app/components/ui/use-toast";
import { ScrollArea } from "@/app/components/ui/scroll-area";

export default function Page({
  params,
}: {
  params: { code: string; year: string };
}) {
  const { toast } = useToast();
  const router = useRouter();

  const [courseData, setCourseData] = useState<courseData | undefined>(
    undefined
  );
  const [courseVisualData, setCourseVisualData] = useState<
    wordCloudData[] | undefined
  >(undefined);
  const [availableYrs, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = [];
    fetchData.push(
      fetchCourseData(
        { code: params.code, year: params.year },
        (courseRes) => {
          setCourseData(courseRes.course);
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
        }
      )
    );
    fetchData.push(
      fetchCourseVisualData(
        { code: params.code, year: params.year },
        (courseRes) => {
          let summaryValues = courseRes.summary.map((x) => {
            return { word: x.phrase, value: x.score, group: x.source };
          });
          setCourseVisualData(summaryValues);
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
        }
      )
    );
    fetchData.push(
      fetchCourses(
        (res) => {
          const versions = res.courses.filter((x) => x.code === params.code);
          const availableYrs = [];
          for (const version of versions) {
            version.year && availableYrs.push(version.year);
          }
          setAvailableYears(availableYrs);
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
        }
      )
    );
    Promise.all(fetchData);
  }, [params.code, params.year]);

  return (
    <div className="flex flex-col items-center">
      <Navbar />
      <div className="lg:w-[60rem] md:w-[45rem] xs:w-screen xs:mx-4 mt-12 flex flex-col md:flex-row px-4">
        <ArrowLeft
          className="w-4 md:w-6 mr-6 mt-2 ml-4 hover:text-slate-400 hover:cursor-pointer"
          strokeWidth={2.25}
          onClick={() => {
            router.back();
          }}
        />
        <div className="flex flex-col xs:w-1/2 md:w-2/3 md:pr-12 mx-4 ">
          <div>
            <div className="text-xl sm:text-3xl lg:text-4xl font-bold pb-4">
              {courseData?.code}
            </div>
            <div className="flex gap-6 items-end justify-between md:pr-6 mb-6">
              <div className="text-base sm:text-lg lg:text-2xl font-bold">
                {courseData?.title}
              </div>
              <div className="text-sm sm:text-md lg:text-xl font-semibold">
                {availableYrs.length === 1 ? (
                  params.year
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex items-end hover:cursor-pointer">
                        {params.year}
                        <ChevronDown className="w-4 md:w-6" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto pr-24 pl-6 py-4">
                      <div>
                        <Label htmlFor="course-version-selector">Year</Label>
                        <RadioGroup
                          defaultValue={`option-${params.year}`}
                          onValueChange={(v) => {
                            v = v.replace("option-", "");
                            router.push(`/courses/${v}/${params.code}`);
                          }}
                        >
                          {availableYrs.sort().map((yr) => {
                            return (
                              <div
                                className="flex items-center space-x-2"
                                key={yr}
                              >
                                <RadioGroupItem
                                  value={`option-${yr}`}
                                  id={`option-${yr}`}
                                />
                                <Label htmlFor={`option-${yr}`}>{yr}</Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>
          <ScrollArea
            className={
              "md:h-[30rem]md:pr-2 mt-0 sm:mt-2 lg:mt-6 text-xs sm:text-base lg:text-base xl:text-lg"
            }
          >
            {courseData?.summary}
          </ScrollArea>
        </div>
        <div className="flex flex-col w-screen xs:w-1/2 md:w-1/3 h-1/4 ml-0 px-4 md:px-0 lg:ml-6 mt-6">
          {courseVisualData && (
            <WordCloudChart
              data={courseVisualData}
              options={{
                title: params.code,
                resizable: true,
                legend: {
                  enabled: false,
                },
                wordCloud: {},
                height: "35rem",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
