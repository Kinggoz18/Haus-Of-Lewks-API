import { ReturnObject } from '../util/returnObject.js';
import { DigitalOceanSpacesManager } from './DigitalOceanService.js';
import MediaModel from '../models/Media.js';

export class MediaService {
  /**
   * Default constructor
   * @param {DigitalOceanSpacesManager} spacesManager
   */
  constructor(spacesManager) {
    this.spacesManager = spacesManager;
  }

  /**
   * Save a media
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  addMedia = async (req, res) => {
    const file = req?.file;
    const { type, tag } = req.body;
    try {
      if (!file) {
        const response = ReturnObject(false, 'File is required');
        return res.status(400).send(response);
      }
      if (!tag) {
        const response = ReturnObject(false, 'File tag required');
        return res.status(400).send(response);
      }
      if (!type) {
        const response = ReturnObject(false, 'Type is required');
        return res.status(400).send(response);
      }

      let secureUrl = null;
      if (type === 'Image') {
        secureUrl = await this.spacesManager.uploadImage(file?.buffer);
      } else if (type === 'Video') {
        secureUrl = await this.spacesManager.uploadVideo(file?.buffer);
      }

      const newMeda = await MediaModel.create({
        tag,
        link: secureUrl,
        type
      });

      const response = ReturnObject(true, newMeda);
      return res.status(204).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while trying to save media'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Delete a media
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  deleteMedia = async (req, res) => {
    const { id } = req.body;

    try {
      if (!id) {
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      const mediaToDelete = await MediaModel.findById(id);
      if (!mediaToDelete) {
        const response = ReturnObject(false, 'Media not found');
        return res.status(404).send(response);
      }

      await this.spacesManager.deleteSingleResource(mediaToDelete?.link);
      await MediaModel.deleteOne({ _id: mediaToDelete?._id });

      const response = ReturnObject(true, 'Media deleted');
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while trying to delete media'
      );
      return res.status(400).send(response);
    }
  };
}
