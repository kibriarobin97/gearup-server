import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IRegisterUserPayload } from "./auth.interface";
import config from "../../config";

const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, email, password, profilePhoto, role } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new Error("User already exists with this email");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.BCRYPT_SALT_ROUNDS),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role: role === "ADMIN" ? "CUSTOMER" : role || "CUSTOMER",
      profile: {
        create: {
          profilePhoto,
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email || email,
    },
    omit: { password: true },
    include: {
      profile: true,
    },
  });
  return user;
};

export const authService = {
  registerUser,
};
