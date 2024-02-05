import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ErrorResponse, SuccessResponse } from "../utilities/response";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import { v4 as uuid } from "uuid";
import axios from "axios";

const s3Client = new S3Client();

export const ImageUploader = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> => {
  const fileContentBase64 = event.body;

  if (!fileContentBase64) {
    return ErrorResponse(400, "File content is missing.");
  }

  let contentType = event.headers["Content-Type"];

  if (!contentType) {
    contentType = `image/jpeg`;
  }
  const fileFormat = contentType.split("/").pop()?.toLowerCase();

  const fileName = `${uuid()}__file.${fileFormat}`;

  const putObjectParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    ContentType: `image/${fileFormat}`,
  };

  const fileContent = Buffer.from(fileContentBase64, "base64");

  try {
    const presignedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(putObjectParams),
      { expiresIn: 3600 }
    );

    await axios.put(presignedUrl, fileContent, {
      headers: {
        "Content-Type": contentType,
      },
    });

    console.log("File uploaded successfully:", fileName);

    const imageUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    const responseBody = JSON.stringify({
      url: imageUrl,
      Key: fileName,
    });

    return SuccessResponse({ body: responseBody });
  } catch (error) {
    console.error("Error interacting with S3:", error);
    return ErrorResponse(500, "Internal Server Error");
  }
};
