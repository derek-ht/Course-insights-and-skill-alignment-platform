import { addCourseWebParams } from "../components/courses/CourseCreateVLink";
import { addCoursePdfParams } from "../components/courses/CourseCreateVPdf";
import { apiCall } from "./ApiUtils";
import { SummaryData } from "./SummaryUtils";

export interface courseData {
  id: string;
  code?: string;
  title?: string;
  summary?: string;
  year?: string;
  iat?: string;
  ownerId?: string;
}

type SingularCourse = {
  course: courseData;
};

type MultipleCourses = {
  courses: courseData[];
};

export interface courseDataParams {
  code: string;
  year: string;
}
export interface uploadTranscriptParams {
  uId: string;
  file: string;
}

export const fetchCourses = async (
  onSuccess: (res: MultipleCourses) => void,
  onFail: (res: string) => void
) => {
  apiCall(`courses/all`, "GET", {}, onSuccess, onFail);
};

export const fetchOwnedCourses = async (
  onSuccess: (res: MultipleCourses) => void,
  onFail: (res: string) => void
) => {
  const userId = localStorage.getItem("uID");
  apiCall(`courses/owned?uId=${userId}`, "GET", {}, onSuccess, onFail);
};

export const fetchEnrolledCourses = async (
  onSuccess: (res: MultipleCourses) => void,
  onFail: (res: string) => void
) => {
  const userId = localStorage.getItem("uID");
  apiCall(`courses/enrolled?uId=${userId}`, "GET", {}, onSuccess, onFail);
};

export const addCourseWeb = async (
  params: addCourseWebParams,
  onSuccess: () => void,
  onFail: (res: string) => void
) => {
  const userId = localStorage.getItem("uID");
  apiCall(
    `academic/addcourse/web`,
    "POST",
    { ...params, uId: userId },
    onSuccess,
    onFail
  );
};

export const addCoursePdf = async (
  params: addCoursePdfParams,
  onSuccess: () => void,
  onFail: (res: string) => void
) => {
  const userId = localStorage.getItem("uID");
  apiCall(
    `academic/addcourse/pdf`,
    "POST",
    { ...params, uId: userId },
    onSuccess,
    onFail
  );
};

export const fetchCourseData = async (
  params: courseDataParams,
  onSuccess: (res: SingularCourse) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `course?code=${params.code}&year=${params.year}`,
    "GET",
    {},
    onSuccess,
    onFail
  );
};

export const fetchCourseVisualData = async (
  params: courseDataParams,
  onSuccess: (res: SummaryData) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `course/summary/visual?code=${params.code}&year=${params.year}`,
    "GET",
    {},
    onSuccess,
    onFail
  );
};

export const completeMultipleCourse = async (
  params: courseDataParams[],
  onSuccess: () => void,
  onFail: (res: string) => void
) => {
  const userId = localStorage.getItem("uID");
  apiCall(
    `user/addcourse/multiple`,
    "POST",
    { courses: params, uId: userId },
    onSuccess,
    onFail
  );
};

export const uploadTranscript = async (
  params: uploadTranscriptParams,
  onSuccess: () => void,
  onFail: (res: string) => void
) => {
  apiCall(`user/uploadtranscript`, "POST", params, onSuccess, onFail);
};

export const deleteCourse = async (
  params: courseDataParams,
  onSuccess: () => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `course?code=${params.code}&year=${params.year}`,
    "DELETE",
    {},
    onSuccess,
    onFail
  );
};

export const removeCourse = async (
  params: courseDataParams,
  onSuccess: () => void,
  onFail: (res: string) => void
) => {
  const userId = localStorage.getItem("uID");
  apiCall(
    `user/removecourse`,
    "POST",
    { ...params, uId: userId },
    onSuccess,
    onFail
  );
};
