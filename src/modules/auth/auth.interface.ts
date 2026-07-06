import { UserRole } from "../../../generated/prisma/enums";

export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
  profilePhoto?: string;
  role?: UserRole;
}

export interface ILoginUserPayload {
  email: string;
  password: string;
}