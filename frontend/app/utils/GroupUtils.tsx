import { apiCall } from "./ApiUtils";
import { visualData } from "./SummaryUtils";

export interface GroupInfo {
  name: string;
  description: string;
  members: GroupMemberType[];
  size: number;
  coverPhoto: string;
  projectId: string;
  skills: visualData[];
}

export interface GroupType extends GroupInfo {
  id: string;
}

export interface GroupMemberType {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export const userIsMember = (uId: string, group: GroupInfo): boolean => {
  return group.members.filter((m: GroupMemberType) => m.id === uId).length > 0;
};

export const getGroup = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group?gId=${gId}`, "GET", {}, onSuccess, onFail);
};

export const getGroups = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`groups/all`, "GET", {}, onSuccess, onFail);
};

export const createGroup = async (
  name: string,
  description: string,
  size: number,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId) {
    const body = { uId, name, description, size };
    apiCall(`group/create`, "POST", body, onSuccess, onFail);
  } else {
    onFail("Cannot get uId");
  }
};

export const editGroupName = async (
  gId: string,
  name: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { gId, name };
  apiCall(`group/updatename`, "PUT", body, onSuccess, onFail);
};

export const editGroupDescription = async (
  gId: string,
  description: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { gId, description };
  apiCall(`group/updatedescription`, "PUT", body, onSuccess, onFail);
};

export const editGroupSize = async (
  gId: string,
  size: number,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { gId, size };
  apiCall(`group/updatesize`, "PUT", body, onSuccess, onFail);
};

export const editGroupCoverPhoto = async (
  gId: string,
  imageUrl: string,
  width: number,
  height: number,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { gId, imageUrl, topLeftX: 0, topLeftY: 0, width, height };
  apiCall(`group/setcoverphoto`, "PUT", body, onSuccess, onFail);
};

export const deleteGroup = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group?gId=${gId}`, "DELETE", {}, onSuccess, onFail);
};

export const joinGroup = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    const body = { uId, gId };
    apiCall(`group/join`, "POST", body, onSuccess, onFail);
  }
};

export const leaveGroup = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId == null) {
    onFail("Invalid uId");
  } else {
    const body = { uId, gId };
    apiCall(`group/leave`, "POST", body, onSuccess, onFail);
  }
};

export const joinProject = async (
  gId: string,
  pId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { gId, pId };
  apiCall(`group/joinproject`, "POST", body, onSuccess, onFail);
};

export const recommendedProjects = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group/recommendedprojects?gId=${gId}`, "GET", {}, onSuccess, onFail);
};

export const recommendedUsers = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group/recommendedusers?gId=${gId}`, "GET", {}, onSuccess, onFail);
};

export const getRecommendUsersToGroup = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group/recommendedusers?gId=${gId}`, "GET", {}, onSuccess, onFail);
};

export const getGroupRequests = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group/requests?gId=${gId}`, "GET", {}, onSuccess, onFail);
};

export const getGroupInvites = async (
  gId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group/invites?gId=${gId}`, "GET", {}, onSuccess, onFail);
};

export const getGroupRecruiting = async (
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`groups/recruiting?uId=${uId}`, "GET", {}, onSuccess, onFail);
};

export const inviteUserToGroup = async (
  gId: string,
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`group/invite`, "POST", { gId, uId }, onSuccess, onFail);
};

export const uninviteUserToGroup = async (
  gId: string,
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `group/uninvite?uId=${uId}&gId=${gId}`,
    "DELETE",
    {},
    onSuccess,
    onFail
  );
};
export const rejectGroupRequest = async (
  gId: string,
  uId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `group/request/reject?uId=${uId}&gId=${gId}`,
    "DELETE",
    {},
    onSuccess,
    onFail
  );
};
