import { UserModel } from "../models/user-model";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const APP_SECRET = "our_app_secret";

export const GetHashedPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string
) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

export const GetToken = ({
  id,
  firstName,
  lastName,
  email,
  role,
}: UserModel) => {
  return jwt.sign(
    {
      id,
      firstName,
      lastName,
      email,
      role,
    },
    APP_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const VerifyToken = async (
  token: string
): Promise<UserModel | false> => {
  try {
    if (token !== "") {
      const payload = await jwt.verify(token.split(" ")[1], APP_SECRET);
      return payload as UserModel;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};
