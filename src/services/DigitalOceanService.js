import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { digitaloceanEnvVariables } from '../config/enviornment.js';

export class DigitalOceanSpacesManager {
  s3Client = null;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: 'https://tor1.digitaloceanspaces.com',
      forcePathStyle: false,
      region: 'tor1',
      credentials: {
        accessKeyId: digitaloceanEnvVariables.spacesKey,
        secretAccessKey: digitaloceanEnvVariables.spacesSecret
      }
    });
  }

  /**
   * Uploads an image to digital ocean spaces
   * @param {Buffer} imageBuffers
   * @returns {Promise<String>} secure_url
   */
  uploadImage = async (imageBuffers) => {
    try {
      const buffer = imageBuffers;
      const fn = this.generateFileName();
      const key = `images/${fn}.jpg`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: digitaloceanEnvVariables.spacesBucket,
          Key: key,
          Body: buffer,
          ACL: 'public-read'
        })
      );

      const secure_url = `https://${digitaloceanEnvVariables.spacesBucket}.tor1.digitaloceanspaces.com/${key}`;
      return secure_url;
    } catch (error) {
      throw new Error(
        error?.message ??
          'Something went wrong while uploading image to digital oceans spaces'
      );
    }
  };

  /**
   * Uploads a video to digital ocean spaces
   * @param {Buffer} videoBuffer
   * @returns {Promise<String>} secure_url
   */
  uploadVideo = async (videoBuffer) => {
    try {
      const buffer = videoBuffer;
      const fn = this.generateFileName();
      const key = `videos/${fn}.jpg`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: digitaloceanEnvVariables.spacesBucket,
          Key: key,
          Body: buffer,
          ACL: 'public-read'
        })
      );

      const secure_url = `https://${digitaloceanEnvVariables.spacesBucket}.tor1.digitaloceanspaces.com/${key}`;
      return secure_url;
    } catch (error) {
      throw new Error(
        error?.message ??
          'Something went wrong while uploading video to digital oceans spaces'
      );
    }
  };

  /**
   * Delete a single resource from Digital ocean
   * @param {*} url
   */
  deleteSingleResource = async (url) => {
    try {
      //Delete the video
      const parsedUrl = new URL(url.trim());
      const key = parsedUrl.pathname.slice(1);

      const deleteParams = {
        Bucket: digitaloceanEnvVariables.spacesBucket,
        Key: key
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);
      const resposne = await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error({ Error: error?.message ?? error });
      throw new Error(
        error?.message ??
          'Something went wrong while deleting resource from digital oceans spaces'
      );
    }
  };

  deleteMultipleResources = async () => {};

  /**
   * Generate file name for uploaded media
   * @param {*} userId
   * @returns
   */
  generateFileName() {
    const timestamp = Date.now();
    const shortUuid = uuidv4();
    return `${timestamp}${shortUuid}`.replace(/[^a-zA-Z0-9]/g, '');
  }
}
