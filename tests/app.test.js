import request from 'supertest';
import initExpressApp from '../src/config/app.js';
import connectToDb from '../src/config/database.js';
import { serverEnvVaiables } from '../src/config/enviornment.js';
import septemberSchedules from './data/scheduleData.js';
import hairServicesData from './data/hairServicesData.js';

describe('Test the root path', () => {
  let databaseClient;
  let app;

  //Connect to the database
  beforeAll(async () => {
    databaseClient = await connectToDb();
    app = await initExpressApp(databaseClient);
  });

  /******************************************************************************************************************/
  /******************************************* Schedule Tests ********************************************************/
  /******************************************************************************************************************/
  let schedules = [];

  // test('It should CREATE a schedule at the POST method', async () => {
  //   const path = `${serverEnvVaiables.basePath}/schedule/create`;

  //   for (let i = 0; i < 5; i++) {
  //     const response = await request(app)
  //       .post(path)
  //       .send(septemberSchedules[i]);
  //     expect(response.statusCode).toBe(201);
  //   }
  // });

  test('It should GET ALL schedule at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/schedule`;
    const response = await request(app).get(path);
    const allSchedule = response?._body?.content;

    expect(response.statusCode).toBe(200);
    schedules = allSchedule;
  });

  test('It should GET a schedule at the POST method', async () => {
    const path = `${serverEnvVaiables.basePath}/schedule/${schedules[0]?._id}`;
    const response = await request(app).get(path);
    const schedule = response?._body?.content;

    expect(response.statusCode).toBe(200);
    // expect(schedule).toBe(schedules[0]);
  });

  test('It should UPDATE a schedule at the POST method', async () => {
    const path = `${serverEnvVaiables.basePath}/schedule/update`;

    const scheduleToUpdate = {
      scheduleId: schedules[0]?._id,
      startTime: '00:30am',
      endTime: '10:30am'
    };

    const response = await request(app).post(path).send(scheduleToUpdate);
    expect(response.statusCode).toBe(200);
  });

  // test('It should DELETE a schedule at the POST method', async () => {
  //   const path = `${serverEnvVaiables.basePath}/schedule/delete`;

  //   for (let i = 0; i < 5; i++) {
  //     const scheduleId = schedules[i]?._id;
  //     const response = await request(app).post(path).send({ scheduleId });
  //     expect(response.statusCode).toBe(200);
  //     const data = response?._body?.content;
  //     schedules.push(data);
  //   }
  // });

  /***********************************************************************************************************************/
  /******************************************* Hair Service Tests ********************************************************/
  /***********************************************************************************************************************/
  let hairServices = [];

  // test('It should CREATE a Hair Service at the POST method', async () => {
  //   const path = `${serverEnvVaiables.basePath}/hair-service`;

  //   for (let i = 0; i < hairServicesData.length; i++) {
  //     const response = await request(app).post(path).send(hairServicesData[i]);
  //     expect(response.statusCode).toBe(201);
  //     const data = response?._body?.content;
  //     hairServices.push(data);
  //   }
  // });

  test('It should GET All Hair Services by category at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/hair-service`;
    const response = await request(app).get(path);
    expect(response.statusCode).toBe(200);
    const data = response?._body?.content;
    hairServices = data;
  });

  test('TEST 1: It should GET a Hair Service by scheduleId at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/hair-service/available`;
    const data1 = {
      scheduleId: schedules[1]?._id,
      startTime: '15:00pm'
    };

    const response = await request(app).post(path).send(data1);
    expect(response.statusCode).toBe(200);
  });

  test('TEST 2: It should GET a Hair Service by scheduleId at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/hair-service/available`;
    const data2 = {
      scheduleId: schedules[1]?._id,
      startTime: '10:00am'
    };

    const response = await request(app).post(path).send(data2);
    expect(response.statusCode).toBe(200);
  });

  // test('It should UPDATE Hair Services by category at the POST method', async () => {
  //   const data = {
  //     id: hairServices['Box Braids'][0]?._id,
  //     title: 'Test title',
  //     price: 100,
  //     category: 'Box Braids'
  //   };

  //   const path = `${serverEnvVaiables.basePath}/hair-service/update`;
  //   const response = await request(app).post(path).send(data);
  //   expect(response.statusCode).toBe(200);
  //   hairServices = data;
  // });

  // test('It should DELETE Hair Services by category using DELETE method', async () => {
  //   const categories = Object.values(hairServices); // gets the arrays (Box Braids, Knotless, etc.)

  //   for (const services of categories) {
  //     for (const service of services) {
  //       const path = `${serverEnvVaiables.basePath}/hair-service/${service?._id}`;
  //       const response = await request(app).delete(path);
  //       expect(response.statusCode).toBe(200);
  //     }
  //   }
  // });

  /******************************************************************************************************************/
  /******************************************* Booking Tests ********************************************************/
  /******************************************************************************************************************/
  let createdBooking;
  let allBookings;
  // test('It should CREATE a booking at the POST method', async () => {
  //   const selectedService = hairServices['Knotless'][0];
  //   let totalDuration = Number(selectedService?.duration);
  //   selectedService?.addOns?.forEach((addon) => {
  //     totalDuration += Number(addon?.duration);
  //   });

  //   const data = {
  //     firstName: 'Chigozie',
  //     lastName: 'Chigozie',
  //     phone: '123456789',
  //     email: 'chigozie@mail.com',
  //     startTime: '17:00pm',
  //     scheduleId: '688fbbaab4f5b8608cf9c95e',
  //     service: {
  //       title: hairServices['Knotless'][0]?.title,
  //       price: hairServices['Knotless'][0]?.price,
  //       category: hairServices['Knotless'][0]?.category,
  //       duration: totalDuration,
  //       hairServiceId: hairServices['Knotless'][0]?._id
  //     }
  //   };

  //   const path = `${serverEnvVaiables.basePath}/booking`;

  //   const response = await request(app).post(path).send(data);
  //   expect(response.statusCode).toBe(201);
  //   createdBooking = response?._body?.content;
  // });

  test('It should GET all booking at the GET method', async () => {
    const selectedService = hairServices['Knotless'][0];
    let totalDuration = Number(selectedService?.duration);
    selectedService?.addOns?.forEach((addon) => {
      totalDuration += Number(addon?.duration);
    });

    const data = {
      status: 'Upcoming'
    };

    const path = `${serverEnvVaiables.basePath}/booking/get-bookings`;

    const response = await request(app).post(path).send({});
    expect(response.statusCode).toBe(200);
    allBookings = response?._body?.content;
  });

  test('It should GET a booking by id at the GET method', async () => {
    const path = `${serverEnvVaiables.basePath}/booking/${allBookings[0]?._id}`;

    const response = await request(app).get(path);
    expect(response.statusCode).toBe(200);
    const fetchedBooking = response?._body?.content;

    console.log({ fetchedBooking });
  });

  test('It should UPDATE a booking by id at the POST method', async () => {
    const data = {
      bookingId: allBookings[0]?._id,
      status: 'Completed'
    };

    const path = `${serverEnvVaiables.basePath}/booking/update-status`;

    const response = await request(app).post(path).send(data);
    expect(response.statusCode).toBe(200);
    const updatedBooking = response?._body?.content;

    console.log({ updatedBooking });
  });

  test('It should GET a booking by a user info at the POST method', async () => {
    const data = {
      firstName: 'Chigozie',
      lastName: 'Chigozie',
      phone: '123456789',
      email: 'chigozie@mail.com'
    };

    const path = `${serverEnvVaiables.basePath}/booking/find-user-bookings`;

    const response = await request(app).post(path).send(data);
    expect(response.statusCode).toBe(200);
    const userBookings = response?._body?.content;

    console.log({ userBookings });
  });

  /******************************************************************************************************************/
  /******************************************* User Tests ********************************************************/
  /******************************************************************************************************************/

  /******************************************************************************************************************/
  /******************************************* Media Tests ********************************************************/
  /******************************************************************************************************************/
});
