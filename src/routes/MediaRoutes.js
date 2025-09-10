import rateLimit from 'express-rate-limit';
import { MediaService } from '../services/Media.js';
import { MulterType } from 'multer';

export class MediaRoute {
  bookingRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  basePath = '/media';

  /**
   * Default constructor
   * @param {MediaService} mediaService
   */
  constructor(mediaService) {
    this.mediaService = mediaService;
  }

  /**
   * Initialize Booking routes
   * @param {Router} router
   * @param {MulterType} upload
   */
  async initRoutes(router, upload) {
    try {
      router.post(
        `${this.basePath}/create`,
        upload.single('file'),
        this.mediaService.addMedia
      );
      router.post(`${this.basePath}/delete`, this.mediaService.deleteMedia);
    } catch (error) {
      console.error(error?.messsage ?? error ?? 'Failed to initialize routes');
    }
  }
}
