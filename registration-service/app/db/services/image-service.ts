import { autoInjectable } from "tsyringe";
import { PlayerRepository } from "../repositories/player-repository";
import { TeamRepository } from "../repositories/team-repository";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ErrorResponse, SuccessResponse } from "../../utilities/response";
import { v4 as uuid } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";

@autoInjectable()
export class ImageService {
  private playerRepository!: PlayerRepository;
  private teamRepository!: TeamRepository;

  constructor(
    playerRepository: PlayerRepository,
    teamRepository: TeamRepository
  ) {
    this.playerRepository = playerRepository;
    this.teamRepository = teamRepository;
  }

  async uploadImage(event: APIGatewayProxyEventV2) {
    const s3Client = new S3Client();

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

      const entityType = event.pathParameters?.entityType;
      const entityId = event.pathParameters?.id;

      if (!entityType || !entityId) {
        return ErrorResponse(400, "Entity type or ID is missing.");
      }

      let updated = false;
      if (entityType === "players") {
        updated = await this.playerRepository.updatePlayerPhotoUrl(
          entityId,
          imageUrl
        );
      } else if (entityType === "teams") {
        updated = await this.teamRepository.updateTeamLogoUrl(
          entityId,
          imageUrl
        );
      } else {
        return ErrorResponse(400, "Invalid entity type.");
      }

      if (updated) {
        console.log("image updated successfully");
      } else {
        console.log("image was not updated");
      }

      const responseBody = JSON.stringify({
        url: imageUrl,
        Key: fileName,
      });

      return SuccessResponse({ body: responseBody });
    } catch (error) {
      console.error("Error interacting with S3:", error);
      return ErrorResponse(500, "Internal Server Error");
    }
  }
}
