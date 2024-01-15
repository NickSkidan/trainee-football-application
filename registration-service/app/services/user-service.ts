import { APIGatewayProxyEventV2 } from "aws-lambda";
import { ErrorResponse, SuccessResponse } from "../utilities/response";
import { UserRepository } from "../repositories/user-repository";
import { autoInjectable } from "tsyringe";
import { plainToClass } from "class-transformer";
import { RegistrationInput } from "../dto/registration-input";
import { AppValidationError } from "../utilities/errors";
import {
  GetHashedPassword,
  GetToken,
  ValidatePassword,
  VerifyToken,
} from "../utilities/password";
import { LoginInput } from "../dto/login-input";
import {
  GenerateAccessCode,
  SendVerificationCode,
} from "../utilities/notification";
import { VerificationInput } from "../dto/verification-input";
import { TimeDifference } from "../utilities/date-helper";
import { ProfileInput } from "../dto/profile-input";
import { ProfileEditInput } from "../dto/update-profile-input";

@autoInjectable()
export class UserService {
  repository: UserRepository;
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  async ResponseWithError(event: APIGatewayProxyEventV2) {
    return ErrorResponse(404, "requested method is not supported!");
  }

  async createUser(event: APIGatewayProxyEventV2) {
    try {
      const input = plainToClass(RegistrationInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }
      const existingUserByEmail = await this.repository.getUserByEmail(
        input.email
      );
      if (existingUserByEmail) {
        throw new Error("user with such email already exists");
      }
      const existingUserByPhone = await this.repository.getUserByPhone(
        input.phone
      );
      if (existingUserByPhone) {
        throw new Error("user with such phone already exists");
      }

      const hashedPassword = await GetHashedPassword(input.password);
      const data = await this.repository.createUser({
        email: input.email,
        password: hashedPassword,
        phone: input.phone,
      });

      if (!data) {
        throw new Error("failed to create user");
      } else {
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async loginUser(event: APIGatewayProxyEventV2) {
    try {
      const input = plainToClass(LoginInput, event.body);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      }

      const data = await this.repository.getUserByEmail(input.email);
      if (data) {
        const verified = await ValidatePassword(input.password, data.password);
        if (!verified) {
          throw new Error("password does not match");
        }
        const token = await GetToken(data);
        return SuccessResponse({ token });
      } else {
        throw new Error("failed to get user by email");
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async verifyUser(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload) {
      return ErrorResponse(403, "authorization failed!");
    }

    const input = plainToClass(VerificationInput, event.body);
    const error = await AppValidationError(input);
    if (error) {
      return ErrorResponse(404, error);
    }

    const data = await this.repository.getUserByEmail(payload.email);

    if (!data) {
      return ErrorResponse(404, "user is not found");
    }

    const { verification_code, expiry } = data;
    if (verification_code === parseInt(input.code)) {
      const currentTime = new Date();

      if (expiry) {
        const diff = TimeDifference(expiry, currentTime.toISOString(), "m");

        if (diff > 0) {
          if (payload.id) {
            await this.repository.updateVerifyUser(payload.id);
            console.log("verified successfully!");
          }
        } else {
          return ErrorResponse(403, "verification code is expired!");
        }
      }
    }
    return SuccessResponse({ message: "user verified!" });
  }

  async getVerificationToken(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (token) {
      const payload = await VerifyToken(token);
      if (!payload) {
        return ErrorResponse(403, "authorization failed!");
      }
      const { code, expiry } = GenerateAccessCode();
      if (payload.id) {
        await this.repository.updateVerificationCode(payload.id, code, expiry);
        console.log("verification code was inserted into the db");
      }
      const response = await SendVerificationCode(code, payload.email);
      return SuccessResponse({
        message: "Verification code is sent to your email",
      });
    }
  }

  async createProfile(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload) {
      return ErrorResponse(403, "authorization failed!");
    }
    const input = plainToClass(ProfileInput, event.body);
    const error = await AppValidationError(input);
    if (error) {
      return ErrorResponse(404, error);
    }

    if (!payload.id) {
      return ErrorResponse(404, "id of user was not found");
    }

    const result = await this.repository.createProfile(payload.id, input);
    if (result) {
      return SuccessResponse({ message: "User Profile was created" });
    } else {
      return ErrorResponse(404, "error during creating user profile");
    }
  }

  async getProfile(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload || !payload.id) {
      return ErrorResponse(403, "authorization failed!");
    }
    const data = await this.repository.getUserProfile(payload.id);
    if (data) {
      return SuccessResponse(data);
    } else {
      return ErrorResponse(404, "no profile for given user");
    }
  }

  async editProfile(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if (!token) {
      return ErrorResponse(403, "authorization failed!");
    }

    const payload = await VerifyToken(token);
    if (!payload) {
      return ErrorResponse(403, "authorization failed!");
    }
    const input = plainToClass(ProfileEditInput, event.body);
    const error = await AppValidationError(input);
    if (error) {
      return ErrorResponse(404, error);
    }

    if (!payload.id) {
      return ErrorResponse(404, "id of user was not found");
    }

    const result = await this.repository.updateProfile(payload.id, input);
    if (result) {
      return SuccessResponse({ message: "User Profile was updated" });
    } else {
      return ErrorResponse(404, "error during editing user profile");
    }
  }
}
