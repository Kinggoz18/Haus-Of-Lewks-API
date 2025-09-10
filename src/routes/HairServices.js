import { MulterType } from 'multer';
import { HairServices } from '../services/HairServices.js';
import rateLimit from 'express-rate-limit';

export class HairServicesRoute {
  bookingRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  basePath = '/hair-service';

  /**
   * Default constructor
   * @param {HairServices} hairService
   */
  constructor(hairService) {
    this.hairService = hairService;
  }

  /**
   * Initialize HairServices routes
   * @param {Router} router
   * @param {MulterType} upload
   */
  async initRoutes(router, upload) {
    try {
      /****************************** Add Routes ****************************/
      router.post(`${this.basePath}/service`, this.hairService.addHairService);
      router.post(
        `${this.basePath}/category`,
        upload.single('file'),
        this.hairService.addCategory
      );
      router.post(`${this.basePath}/add-on`, this.hairService.addAddOn);

      /****************************** Delete Routes ***************************/
      router.post(
        `${this.basePath}/service/:id`,
        this.hairService.removeHairService
      );
      router.post(
        `${this.basePath}/category/:id`,
        this.hairService.removeCategory
      );
      router.post(`${this.basePath}/add-on/:id`, this.hairService.removeAddon);

      /****************************** Update Routes ***************************/
      router.post(
        `${this.basePath}/update/service`,
        this.hairService.updateHairService
      );
      router.post(
        `${this.basePath}/update/category`,
        upload.single('file'),
        this.hairService.updateCategory
      );
      router.post(
        `${this.basePath}/update/add-on`,
        this.hairService.updateAddon
      );
      /****************************** Get Routes ****************************/
      router.get(`${this.basePath}`, this.hairService.getServicesByCategory);
      router.get(`${this.basePath}/category`, this.hairService.getCategories);
      router.get(`${this.basePath}/add-on`, this.hairService.getAddons);
      router.post(
        `${this.basePath}/available`,
        this.hairService.getAvailableHairServicesForSchedule
      );
    } catch (error) {
      console.error(error?.messsage ?? error ?? 'Failed to initialize routes');
    }
  }
}
