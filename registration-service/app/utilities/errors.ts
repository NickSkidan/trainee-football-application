import { ValidationError, validate } from "class-validator";

export const AppValidationError = async (
  input: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<ValidationError[] | false> => {
  const error = await validate(input, {
    ValidationError: { target: true },
  });

  if (error.length) {
    return error;
  }
  return false;
};
