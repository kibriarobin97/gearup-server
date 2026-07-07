import { prisma } from "../../lib/prisma";
import { IUpdateUserStatusPayload } from "./admin.interface";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

const updateUserStatus = async (
  userId: string,
  payload: IUpdateUserStatusPayload,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: payload.status,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
};
