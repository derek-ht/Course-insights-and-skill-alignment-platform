import { visualData } from "../utils/SummaryUtils";

export interface UserHoverProps {
  avatar: string;
  pictureAlt: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: UserSkills[];
}

export interface UserSkills {
  phrase: string;
  score: string;
  source: string;
}

export interface ProfileDetailsProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  school?: string;
  degree?: string;
  avatar?: string;
  type?: string;
}

export interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  school?: string;
  degree?: string;
  avatar?: string;
  courses?: string[];
  groups?: string[];
  workExperience?: string[];
  ownedProjects?: string[];
  type: string;
  public: boolean;
  skills?: visualData[];
}

export interface SkillsProps {
  skills: string[];
}

export interface listProps {
  courses: string[];
  ownedProjects: string[];
  groups: string[];
}

export interface CardProps {
  title: string;
  description: string;
}

export interface ProjectCardProps extends CardProps {
  groupName: string;
}

export interface GroupCardProps extends CardProps {
  users: UserHoverProps[];
}
