import React from "react";
import Navbar from "../components/nav/Navbar";
import CourseList from "../components/courses/CompletedCourses";

const Courses = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <Navbar />
      <CourseList />
    </div>
  );
};

export default Courses;
