import { apiCall } from "./ApiUtils";

export const getRecommendedUsers = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(`user/recommendedusers?uId=${uId}`, "GET", {}, onSuccess, onFail);
};
