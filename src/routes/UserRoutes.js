import express, { Router } from 'express';
import UserService from '../services/UserService.js';
import rateLimit from 'express-rate-limit';
import signupAdminMiddleware from '../Middlewares/authMiddleware.js';

export class UserRoutes {
  authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  basePath = '/user';

  /**
   * Default constructor
   * @param {UserService} userService
   */
  constructor(userService) {
    this.userService = userService;
  }

  /**
   * Initialize User routes
   * @param {Router} router
   */
  async initRoutes(router) {
    try {
      router.get(
        `${this.basePath}/login`,
        signupAdminMiddleware,
        this.userService.googleAuthHandler
      );

      router.get(
        `${this.basePath}/:userId`,
        this.userService.getAuthenticatedUser
      );

      router.get(
        `${this.basePath}/login/callback`,
        this.userService.googleAuthHandlerCallback
      );

      router.get(`${this.basePath}/customer`, this.userService.getAllCustomer);
      router.get(
        `${this.basePath}customer/:customerId`,
        this.userService.getCustomerById
      );
      router.get(
        `${this.basePath}/customer/unblock/:customerId`,
        this.userService.unBlockUser
      );
      router.get(`${this.basePath}/logout/:userId`, this.userService.logout);
    } catch (error) {
      console.error(error?.messsage ?? error ?? 'Failed to initialize routes');
    }
  }
}
