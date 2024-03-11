import { projectParams } from "../components/projects/ProjectCreateForm";
import { apiCall } from "./ApiUtils";

export interface ProjectType {
  id: string;
  title: string;
  description: string;
  scope: string;
  topics: string[];
  requiredSkills: string[];
  outcomes: string[];
  maxGroupSize: number;
  minGroupSize: number;
  maxGroupCount: number;
}

/**
 * Get an Academic or Academic User's Owned Projects
 */
export const getOwnedProjects = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId) {
    apiCall(`projects/owned?uId=${uId}`, "GET", {}, onSuccess, onFail);
  } else {
    onFail("Failed to get uID");
  }
};

/**
 * Get a list of all projects created by academics
 */
export const getAllProjects = async (
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`projects/all`, "GET", {}, onSuccess, onFail);
};

export const getProject = async (
  pId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`project?pId=${pId}`, "GET", {}, onSuccess, onFail);
};

export const addProject = async (
  params: projectParams,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`project/add`, "POST", params, onSuccess, onFail);
};

export const joinableGroups = async (
  pId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const uId = localStorage.getItem("uID");
  if (uId) {
    apiCall(`project/userjoinablegroups?uId=${uId}&pId=${pId}`, "GET", {}, onSuccess, onFail);
  } else {
    onFail("Failed to get uID");
  }
};

export const editProjectTitle = async (
  pId: string,
  title: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, title };
  apiCall(`project/settitle`, "PUT", body, onSuccess, onFail);
};

export const editProjectDescription = async (
  pId: string,
  description: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, description };
  apiCall(`project/setdescription`, "PUT", body, onSuccess, onFail);
};

export const editProjectScope = async (
  pId: string,
  scope: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, scope };
  apiCall(`project/setscope`, "PUT", body, onSuccess, onFail);
};


export const editProjectTopics = async (
  pId: string,
  topics: string[],
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, topics };
  apiCall(`project/settopics`, "PUT", body, onSuccess, onFail);
};

export const editProjectSkills = async (
  pId: string,
  requiredSkills: string[],
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, requiredSkills };
  apiCall(`project/setrequiredskills`, "PUT", body, onSuccess, onFail);
};


export const editProjectOutcomes = async (
  pId: string,
  outcomes: string[],
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, outcomes };
  apiCall(`project/setoutcomes`, "PUT", body, onSuccess, onFail);
};



export const editProjectGroupSize = async (
  pId: string,
  minGroupSize: number,
  maxGroupSize: number,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, minGroupSize, maxGroupSize};
  apiCall(`project/setgroupsizes`, "PUT", body, onSuccess, onFail);
};

export const editProjectMaxGroupCount = async (
  pId: string,
  maxGroupCount: number,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, maxGroupCount };
  apiCall(`project/setmaxgroupcount`, "PUT", body, onSuccess, onFail);
};

export const editProjectCoverPhoto = async (
  pId: string,
  imageUrl: string,
  width: number,
  height: number,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  const body = { pId, imageUrl, topLeftX: 0, topLeftY: 0, width, height };
  apiCall(`project/setcoverphoto`, "PUT", body, onSuccess, onFail);
};

export const deleteProject = async (
  pId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`project?pId=${pId}`, "DELETE", {}, onSuccess, onFail);
};

export const getProjectGroups = async (
  pId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(`groups/byproject?pId=${pId}`, "GET", {}, onSuccess, onFail);
};

export const getGroupProjectSkillgap = async (
  gId: string,
  pId: string,
  onSuccess: (value: any) => void,
  onFail: (res: string) => void
) => {
  apiCall(
    `group/project/skillgap?gId=${gId}&pId=${pId}`,
    "GET",
    {},
    onSuccess,
    onFail
  );
};