import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ImageService } from "../db/services/image-service";
import { container } from "tsyringe";

const service = container.resolve(ImageService);

export const ImageUploader = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  return service.uploadImage(event);
};
