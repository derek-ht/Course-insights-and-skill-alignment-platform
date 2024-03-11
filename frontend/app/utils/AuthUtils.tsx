import { loginParams } from "../components/auth/Auth";
import { registerParams } from "../components/auth/RegisterFormInitial";
import { registerDetailsParams } from "../components/auth/RegisterFormDetails";
import { apiCall } from "./ApiUtils";

export const registerUser = async (
  params: registerParams,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall("auth/register/v2", "POST", params, onSuccess, onFail);
};

export const registerDetails = async (
  params: registerDetailsParams,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall("user/setdetails", "PUT", { uId, ...params }, onSuccess, onFail);
};

export const loginUser = async (
  params: loginParams,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall("auth/login", "POST", params, onSuccess, onFail);
};

export const userLogOut = async (
  onSuccess: () => void,
  onFail: (res: string) => void
) => {
  apiCall("auth/logout", "POST", {}, onSuccess, onFail);
};

export const authAcademic = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall("auth/academic-only", "GET", {}, onSuccess, onFail);
};

export const authVerify = async (
  token: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`auth/register/verify/${token}`, "GET", {}, onSuccess, onFail);
};
