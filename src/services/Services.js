import { BookingService } from './BookingService.js';
import { DigitalOceanSpacesManger } from './DigitalOceanService.js';
import { HairServices } from './HairServices.js';
import { MediaService } from './Media.js';
import { ScheduleService } from './ScheduleService.js';
import UserService from './UserService.js';

export class Services {
  constructor() {}

  initServices = () => {
    //Initialize services
    const spacesManager = new DigitalOceanSpacesManger();
    const mediaService = new MediaService(spacesManager);
    const userService = new UserService();
    const scheduleService = new ScheduleService();
    const bookingService = new BookingService(userService, scheduleService);
    const hairServices = new HairServices();

    return {
      spacesManager,
      mediaService,
      userService,
      scheduleService,
      bookingService,
      hairServices
    };
  };
}
