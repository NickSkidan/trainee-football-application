import { User } from "../db/entities/user";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const APP_SECRET = "trainee_football_app_secret";

export const GetHashedPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string
) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

export const GetToken = ({ id, first_name, last_name, email, role }: User) => {
  return jwt.sign(
    {
      id,
      first_name,
      last_name,
      email,
      role,
    },
    APP_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const VerifyToken = async (token: string): Promise<User | false> => {
  try {
    if (token !== "") {
      const payload = await jwt.verify(token.split(" ")[1], APP_SECRET);
      return payload as User;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};
