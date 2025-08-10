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
   */
  async initRoutes(router) {
    try {
      router.post(`${this.basePath}`, this.hairService.addHairService);
      router.get(`${this.basePath}`, this.hairService.getServicesByCategory);
      router.post(
        `${this.basePath}/available`,
        this.hairService.getAvailableHairServicesForSchedule
      );
      router.post(
        `${this.basePath}/update`,
        this.hairService.updateHairService
      );
      router.delete(`${this.basePath}/:id`, this.hairService.removeHairService);
    } catch (error) {
      console.error(error?.messsage ?? error ?? 'Failed to initialize routes');
    }
  }
}
