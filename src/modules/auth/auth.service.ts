import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";
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

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user?.status === "SUSPENDED") {
    throw new Error("Your account has been suspended");
  }

  const isPasswordMatched = await bcrypt.compare(password, user?.password as string);

  if (!isPasswordMatched) {
    throw new Error("Incorrect password");
  }

  return user;
};

export const authService = {
  registerUser,
  loginUser,
};
