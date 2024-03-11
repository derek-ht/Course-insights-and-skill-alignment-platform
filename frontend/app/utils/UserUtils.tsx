import { apiCall } from "./ApiUtils";
import { courseData } from "./CourseUtils";
import { SummaryData } from "./SummaryUtils";

export enum UserType {
  "ACADEMIC",
  "ADMIN",
  "STUDENT",
  "ACADEMIC_ADMIN",
}

export interface userData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  school: string;
  degree: string;
  avatar: string;
  courses: courseData[];
  ownedProjects: string[];
  workExperience: string[];
  groups: string[];
  type: UserType;
}

export interface userPublicDataType {
  id: string;
  firstName: string;
  lastName: string;
  courses: courseData[];
  school: string;
  degree: string;
  avatar: string;
}

export interface userDataType extends userData {
  id: string;
}

export const formatUserType = (role: UserType | string) => {
  const splitRole = role.toString().toLowerCase().split("_");
  return capitaliseFirstLetter(splitRole);
};

const capitaliseFirstLetter = (words: string[]) => {
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substring(1);
  }
  return words.join(" ");
};

/** For fetching the authorised user's data
 *
 * @param onSuccess
 * @param onFail
 */
export const fetchUserData = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const userId = localStorage.getItem("uID");
  if (userId) {
    apiCall(`user?uId=${userId}`, "GET", {}, onSuccess, onFail);
  } else {
    onFail("UserId could not be fetched");
  }
};

/** For fetching another  user's data
 *
 * @param onSuccess
 * @param onFail
 */
export const fetchOtherUserData = async (
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`user?uId=${uId}`, "GET", {}, onSuccess, onFail);
};

/** For fetching the visual summary of authorised user's data
 *
 * @param onSuccess
 * @param onFail
 */
export const fetchUserVisualData = async (
  uId: string,
  onSuccess: (value: SummaryData) => void,
  onFail: (res: string) => void
) => {
  apiCall(`user/summary/visual?uId=${uId}`, "GET", {}, onSuccess, onFail);
};

export const editName = async (
  uId: string,
  firstName: string,
  lastName: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, firstName, lastName };
  apiCall(`user/setname`, "PUT", body, onSuccess, onFail);
};

export const editPassword = async (
  uId: string,
  password: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, password };
  apiCall(`user/setpassword`, "PUT", body, onSuccess, onFail);
};

export const editEmail = async (
  uId: string,
  email: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, email };
  apiCall(`user/setemail`, "PUT", body, onSuccess, onFail);
};

export const editPhoneNumber = async (
  uId: string,
  phoneNumber: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, phoneNumber };
  apiCall(`user/setphone`, "PUT", body, onSuccess, onFail);
};

export const editSchool = async (
  uId: string,
  school: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, school };
  apiCall(`user/setschool`, "PUT", body, onSuccess, onFail);
};

export const editDegree = async (
  uId: string,
  degree: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, degree };
  apiCall(`user/setdegree`, "PUT", body, onSuccess, onFail);
};

export const editAvatar = async (
  uId: string,
  imageUrl: string,
  width: number,
  height: number,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, imageUrl, width, height, topLeftX: 0, topLeftY: 0 };
  apiCall(`user/setavatar`, "PUT", body, onSuccess, onFail);
};

export const editType = async (
  uId: string,
  type: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, type };
  apiCall(`user/settype`, "PUT", body, onSuccess, onFail);
};

export const addExperience = async (
  uId: string,
  workExperience: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, workExperience };
  apiCall(`user/workexperience`, "POST", body, onSuccess, onFail);
};

export const editExperience = async (
  uId: string,
  oldWorkExperience: string,
  newWorkExperience: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { uId, oldWorkExperience, newWorkExperience };
  apiCall(`user/workexperience`, "PUT", body, onSuccess, onFail);
};

export const deleteExperience = async (
  uId: string,
  workExperience: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `user/workexperience?uId=${uId}&workExperience=${workExperience}`,
    "DELETE",
    {},
    onSuccess,
    onFail
  );
};

export const shareProfileMulti = async (
  emails: string[],
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(`user/shareprofile/multi`, "PUT", { uId, emails }, onSuccess, onFail);
};

export const unShareProfile = async (
  unshareToId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(
    `user/unshareprofile`,
    "PUT",
    { uId, unshareToId },
    onSuccess,
    onFail
  );
};

export const unShareAll = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(`user/unshareall`, "PUT", { uId }, onSuccess, onFail);
};

export const getUsersSharedTo = async (
  onSuccess: (data: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(`users/sharedto?uId=${uId}`, "GET", {}, onSuccess, onFail);
};

export const getUserIsShared = async (
  sharedToId: string,
  onSuccess: (data: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(
    `user/isshared?uId=${uId}&sharedWithId=${sharedToId}`,
    "GET",
    {},
    onSuccess,
    onFail
  );
};

export const getUsersVisible = async (
  onSuccess: (data: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(`users/all/visible?uId=${uId}`, "GET", {}, onSuccess, onFail);
};

export const userToggleVisibility = async (
  onSuccess: (data: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  apiCall(`user/togglevisibility`, "PUT", { uId }, onSuccess, onFail);
};

export const recommendedProjects = async (
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `user/recommendedprojects?uId=${uId}`,
    "GET",
    {},
    onSuccess,
    onFail,
  );
};

export const recommendedGroups = async (
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `user/recommendedgroups?uId=${uId}`,
    "GET",
    {},
    onSuccess,
    onFail
  );
};

export const recommendedUsers = async (
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `user/recommendedusers?uId=${uId}`,
    "GET",
    {},
    onSuccess,
    onFail
  );
}

export const getGroupInvites = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    apiCall(`user/invites?uId=${uId}`, "GET", {}, onSuccess, onFail);
  }
};

export const getGroupRequests = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    apiCall(`user/requests?uId=${uId}`, "GET", {}, onSuccess, onFail);
  }
};

export const requestGroup = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    apiCall(`user/request`, "POST", { gId, uId }, onSuccess, onFail);
  }
};

export const cancelRequest = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    apiCall(
      `user/unrequest?uId=${uId}&gId=${gId}`,
      "DELETE",
      {},
      onSuccess,
      onFail
    );
  }
};

export const acceptInvite = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    apiCall(`user/invite/accept`, "POST", { gId, uId }, onSuccess, onFail);
  }
};

export const rejectInvite = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    apiCall(
      `user/invite/reject?uId=${uId}&gId=${gId}`,
      "DELETE",
      {},
      onSuccess,
      onFail
    );
  }
};
