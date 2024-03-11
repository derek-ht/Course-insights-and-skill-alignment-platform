"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { courseData, fetchEnrolledCourses } from "@/app/utils/CourseUtils";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";

const CourseSummaries = () => {
  const { toast } = useToast();
  const router = useRouter();

  const [coursesEnrolled, setCoursesEnrolled] = useState<courseData[]>([]);

  useEffect(() => {
    fetchEnrolledCourses(
      (courseRes) => {
        setCoursesEnrolled(courseRes.courses);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      }
    );
  }, []);
  return (
    <>
      {coursesEnrolled.length !== 0 && (
        <div className="flex items-center w-full">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around w-full max-h-[18rem]">
              <ScrollArea className="w-full rounded-md border flex flex-col gap-6">
                {coursesEnrolled?.map((c) => (
                  <Card
                    key={c.id}
                    className="flex w-full items-center hover:cursor-pointer transition ease-in-out delay-15 hover:bg-slate-50 dark:hover:bg-slate-50/10"
                    onClick={() => {
                      router.push(`/courses/${c.year}/${c.code}`);
                    }}
                  >
                    <CardHeader className="pr-2 font-bold">{c.code}</CardHeader>
                    <CardContent className="py-0 flex items-center justify-between gap-6 w-full">
                      <div className="flex items-center gap-6">
                        <div className="text-xs">{c.year}</div>
                        <div>{c.title}</div>
                      </div>
                      <ArrowRight
                        className="mr-6 mt-2 hover:text-slate-400"
                        strokeWidth={1}
                        size={20}
                        onClick={() => {
                          router.push(`/courses/${c.year}/${c.code}`);
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CourseSummaries;
