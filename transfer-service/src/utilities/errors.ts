import { validate } from "class-validator";

export const ValidateError = async (
  input: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any> | false> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const error = await validate(input, {
    ValidationError: { target: true, property: true },
  });

  if (error.length) {
    return error.map((err) => ({
      field: err.property,
      message:
        (err.constraints && Object.values(err.constraints)[0]) ||
        "incorrect input",
    }));
  }
  return false;
};