import connectToDb from './config/database.js';
import initExpressApp from './config/app.js';
import { serverEnvVaiables } from './config/enviornment.js';

/**
 * How it works:
 * The admin (Angee) enters the schedule for a day, with the start time and end time included
 * She also enters the approx duration a hair style will take, say 2-5 hours
 * Only the hair styles that are doable within the available time frame are displayed (getAvailableServices)
 * The time available is caculuated by checking the start time of all bookings made for the selected schedule and adding it to the duration
 * When a user books an appointment. They select a time available on the schedule that falls in between the start time and end time and the booking Id
 * is added the schedule bookingIdsMade
 */

/**
 * User flow
 * 1. User selects a schedule. Proceeds to Select hair service
 * 2. The scheulde end point is called to return all available hair services for the selected searvice
 * 3. Hair services that can not be completed will not be returned
 * 4. The user selects the service they want and proceeds
 */
const init = async () => {
  try {
    const databaseClient = await connectToDb();
    const app = await initExpressApp(databaseClient);

    //Start the server
    app.listen(serverEnvVaiables.port, () => {
      console.log('Express server running on Port:', serverEnvVaiables.port);
    });
  } catch (error) {
    console.error('Error in init:', error?.message ?? error);
  }
};

init();
