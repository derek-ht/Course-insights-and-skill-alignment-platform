"use client";
import Auth from "./components/auth/Auth";
import Navbar from "./components/nav/Navbar";
import Image from "next/image";
import AuthVector from "/public/assets/auth_vector.svg";
import { useSearchParams } from "next/navigation";
import { fetchUserData } from "./utils/UserUtils";
import { useAccessControlContext } from "./context/accessControl";
import { authVerify } from "./utils/AuthUtils";
import { useEffect, useRef, useState } from "react";
import { useToast } from "./components/ui/use-toast";
import RegisterFormDetails from "./components/auth/RegisterFormDetails";

export default function Home() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { setRole } = useAccessControlContext();
  const [verified, setVerified] = useState(false);
  const hasRun = useRef(false);

  const token = searchParams.get("token");

  const verifyFunction = () => {
    if (token && !verified) {
      const success = (data: any) => {
        localStorage.setItem("uID", data.uId);
        fetchUserData(
          (userRes) => setRole(userRes.type),
          (error: any) => {
            toast({
              variant: "destructive",
              title: "Fetch User Error",
              description: error,
            });
          }
        );
        setVerified(true);
      };
      authVerify(token, success, (error: any) => {
        toast({
          variant: "destructive",
          title: "Verify Error",
          description: error,
        });
      });
    }
  };

  useEffect(() => {
    if (!hasRun.current) {
      verifyFunction();
      hasRun.current = true;
    }
  }, []);

  return (
    <main className="flex flex-col items-center h-[100vh] w-[100vw]">
      <Navbar />
      <div className="flex flex-1 flex-row justify-center items-center w-full xl:w-[80rem] lg:justify-between lg:px-9">
        <div className="flex items-start w-[20rem] h-[33rem] sm:w-[30rem] sm:h-[40rem]">
          {!verified ? <Auth /> : <RegisterFormDetails />}
        </div>
        <Image
          src={AuthVector}
          alt="Person studying"
          className="hidden lg:block w-[30rem] xl:w-[40rem] h-auto"
        />
      </div>
    </main>
  );
}
