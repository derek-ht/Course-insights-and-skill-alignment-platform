import { apiCall } from "./ApiUtils";

export const getAllUsers = async (
  onSuccess: (data: any) => void,
  onFail: (res: string) => void
) => {
  apiCall("users/all", "GET", {}, onSuccess, onFail);
};

export const deleteUser = async (
  uId: string,
  onSuccess: (data: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`user?uId=${uId}`, "DELETE", {}, onSuccess, onFail);
};
