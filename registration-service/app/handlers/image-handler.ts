import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ErrorResponse, SuccessResponse } from "../utilities/response";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "aws-lambda";
import { v4 as uuid } from "uuid";

const s3Client = new S3Client();

export const ImageUploader = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const file = event.queryStringParameters?.file;

  if (!file) {
    return ErrorResponse(400, "File parameter is missing.");
  }

  const fileFormat = file.split(".").pop()?.toLowerCase() ?? "jpeg";

  const fileName = `${uuid()}__${file}`;

  const putObjectParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    ContentType: `image/${fileFormat}`,
  };

  try {
    // Upload file to S3
    const putObjectCommand = new PutObjectCommand(putObjectParams);
    await s3Client.send(putObjectCommand);

    // Generate pre-signed URL
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(putObjectParams),
      { expiresIn: 3600 }
    );

    console.log("UPLOAD URL:", putObjectParams, signedUrl);
    const body = JSON.stringify({
      url: signedUrl,
      Key: fileName,
    });

    return SuccessResponse({ body });
  } catch (error) {
    console.error("Error interacting with S3:", error);
    return ErrorResponse(500, "Internal Server Error");
  }
};
