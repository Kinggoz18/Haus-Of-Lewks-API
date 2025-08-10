import { Router } from 'express';
import { ScheduleService } from '../services/ScheduleService.js';
import rateLimit from 'express-rate-limit';

export class ScheduleRoute {
  scheduleRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  basePath = '/schedule';

  /**
   * Default constructor
   * @param {ScheduleService} scheduleService
   */
  constructor(scheduleService) {
    this.scheduleService = scheduleService;
  }

  /**
   * Initialize Schedule routes
   * @param {Router} router
   */
  async initRoutes(router) {
    try {
      router.post(`${this.basePath}/create`, this.scheduleService.createSchedule);
      router.post(`${this.basePath}/update`, this.scheduleService.updateSchedule);
      router.post(`${this.basePath}/delete`, this.scheduleService.deleteSchedule);
      router.get(
        `${this.basePath}/:scheduleId`,
        this.scheduleService.getScheduleById
      );
      router.get(`${this.basePath}`, this.scheduleService.getAllSchedule);
    } catch (error) {
      console.error(error?.messsage ?? error ?? 'Failed to initialize routes');
    }
  }
}
