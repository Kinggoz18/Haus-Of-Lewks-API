import { BookingService } from '../services/BookingService.js';
import rateLimit from 'express-rate-limit';

export class BookingRoute {
  bookingRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  basePath = '/booking';

  /**
   * Default constructor
   * @param {BookingService} bookingService
   */
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  /**
   * Initialize Booking routes
   * @param {Router} router
   */
  async initRoutes(router) {
    try {
      router.post(`${this.basePath}`, this.bookingService.createBooking);
      router.post(
        `${this.basePath}/get-bookings`,
        this.bookingService.getBookings
      );
      router.get(
        `${this.basePath}/:bookingId`,
        this.bookingService.getBookingById
      );
      router.post(
        `${this.basePath}/update-status`,
        this.bookingService.updateBookingStatusById
      );
      router.post(
        `${this.basePath}/find-user-bookings`,
        this.bookingService.getUserBookings
      );
    } catch (error) {
      console.error(error?.messsage ?? error ?? 'Failed to initialize routes');
    }
  }
}
