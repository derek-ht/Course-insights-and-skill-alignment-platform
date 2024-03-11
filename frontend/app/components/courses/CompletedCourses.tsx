"use client";
import React, { useEffect, useState } from "react";
import CourseUploadTranscript from "./CourseUploadTranscript";
import CourseCreateVLink from "./CourseCreateVLink";
import CourseCreateVPdf from "./CourseCreateVPdf";
import CourseCreateButton from "./CourseCreateButton";
import CompletedCoursesList from "./CompletedCoursesList";
import AddCourse from "./CourseAddDialogue";
import { useAccessControlContext } from "@/app/context/accessControl";
import { fetchUserData, userData } from "@/app/utils/UserUtils";
import {
  courseData,
  fetchCourses,
  fetchOwnedCourses,
} from "@/app/utils/CourseUtils";
import { useToast } from "../ui/use-toast";

enum CourseActions {
  AddCourse = "addCourse",
  CreateVLink = "createVLink",
  CreateVPdf = "createVPdf",
  UploadTranscript = "uploadTranscript",
}

const CourseList = () => {
  const { toast } = useToast();
  const { role, setRole } = useAccessControlContext();
  const [coursesAll, setCoursesAll] = useState<courseData[]>([]);
  const [coursesEnrolled, setCoursesEnrolled] = useState<courseData[]>([]);
  const [coursesOwned, setCoursesOwned] = useState<courseData[]>([]);
  const [courseDeleted, setCourseDeleted] = useState<boolean>(false);

  const [openModals, setOpenModals] = useState({
    addCourse: false,
    createCourseVLink: false,
    createCourseVPdf: false,
    uploadTranscript: false,
  });

  useEffect(() => {
    courseDeleted && setCourseDeleted(false);
    const fetchData = [];
    fetchData.push(
      fetchUserData(
        (userRes: userData) => {
          setRole(userRes.type.toString());
          setCoursesEnrolled(userRes.courses);
          if (userRes.type.toString() === "ACADEMIC") {
            fetchOwnedCourses(
              (res) => {
                setCoursesOwned(res.courses);
              },
              (error) => {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: error,
                });
              }
            );
          }
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
          setCoursesAll(res.courses);
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
  }, [openModals, courseDeleted]);

  const triggerModal = (type: CourseActions) => {
    switch (type) {
      case CourseActions.AddCourse:
        setOpenModals((prevState) => {
          return { ...prevState, addCourse: !openModals.addCourse };
        });
        break;
      case CourseActions.CreateVLink:
        setOpenModals((prevState) => {
          return {
            ...prevState,
            createCourseVLink: !openModals.createCourseVLink,
          };
        });
        break;
      case CourseActions.CreateVPdf:
        setOpenModals((prevState) => {
          return {
            ...prevState,
            createCourseVPdf: !openModals.createCourseVPdf,
          };
        });
        break;
      case CourseActions.UploadTranscript:
        setOpenModals((prevState) => {
          return {
            ...prevState,
            uploadTranscript: !openModals.uploadTranscript,
          };
        });
        break;
    }
  };

  return (
    <div className="mt-12 flex flex-col items-center max-sm:pl-4 xl:w-[80rem] lg:w-[60rem] md:w-[45rem] xs:w-screen xs:mx-4">
      <div className="flex items-center w-full">
        {role && role === "STUDENT" && (
          <div className="flex flex-col sm:flex-row items-center w-full">
            <div className="text-xl font-semibold mb-6 sm:mr-6 sm:mb-0 sm:text-2xl">
              Completed Courses
            </div>
            <AddCourse
              allCourses={coursesAll}
              completedCourses={coursesEnrolled}
              isOpen={openModals.addCourse}
              onOpenChange={(open) =>
                setOpenModals({ ...openModals, addCourse: open })
              }
              onSubmit={() => triggerModal(CourseActions.AddCourse)}
            />
            <CourseUploadTranscript
              isOpen={openModals.uploadTranscript}
              onOpenChange={(open) =>
                setOpenModals({ ...openModals, uploadTranscript: open })
              }
              onSubmit={() => triggerModal(CourseActions.UploadTranscript)}
            />
          </div>
        )}
        {role && role !== "STUDENT" && (
          <>
            <div className="text-2xl font-semibold mr-6">
              {role === "ACADEMIC" ? "Created Courses" : "All Courses"}
            </div>
            <CourseCreateButton
              triggerLink={() => triggerModal(CourseActions.CreateVLink)}
              triggerPdf={() => triggerModal(CourseActions.CreateVPdf)}
            />
            <CourseCreateVLink
              isOpen={openModals.createCourseVLink}
              onOpenChange={(open) =>
                setOpenModals({ ...openModals, createCourseVLink: open })
              }
              onSubmit={() => triggerModal(CourseActions.CreateVLink)}
            />
            <CourseCreateVPdf
              isOpen={openModals.createCourseVPdf}
              onOpenChange={(open) =>
                setOpenModals({ ...openModals, createCourseVPdf: open })
              }
              onSubmit={() => triggerModal(CourseActions.CreateVPdf)}
            />
          </>
        )}
      </div>
      <CompletedCoursesList
        setCourseDeleted={setCourseDeleted}
        courses={
          role === "STUDENT"
            ? coursesEnrolled
            : role === "ACADEMIC"
            ? coursesOwned
            : coursesAll
        }
        role={role}
      />
    </div>
  );
};

export default CourseList;
