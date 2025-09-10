import express from 'express';
import { Services } from '../services/Services.js';
import { BookingRoute } from './BookingRoutes.js';
import { ScheduleRoute } from './ScheduleRoutes.js';
import { UserRoutes } from './UserRoutes.js';
import { HairServicesRoute } from './HairServices.js';
import { MulterType } from 'multer';
import { MediaRoute } from './MediaRoutes.js';

export class APIRoutes {
  /**
   * Default constructor
   */
  constructor() {
    try {
      //Initialize services
      const services = new Services().initServices();

      this.userRoutes = new UserRoutes(services.userService);
      this.scheduleRoutes = new ScheduleRoute(services.scheduleService);
      this.bookingRoutes = new BookingRoute(services.bookingService);
      this.hairServiceRoutes = new HairServicesRoute(services.hairServices);
      this.mediaRoute = new MediaRoute(services.mediaService);

      this.router = express.Router();
    } catch (error) {
      console.error(
        error?.messsage ?? error ?? 'Failed to initialize routes in constructor'
      );
    }
  }

  /**
   * Initialize the routes
   * @param {MulterType} upload
   * @returns
   */
  async initAllRoutes(upload) {
    try {
      await this.userRoutes.initRoutes(this.router);
      await this.scheduleRoutes.initRoutes(this.router);
      await this.bookingRoutes.initRoutes(this.router);
      await this.hairServiceRoutes.initRoutes(this.router, upload);
      await this.mediaRoute.initRoutes(this.router, upload);

      return this.router;
    } catch (error) {
      console.error(error?.messsage ?? error ?? 'Failed to initialize routes');
      return this.router;
    }
  }
}
