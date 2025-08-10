const { Collection } = 'mongoose';
import ScheduleModel from '../models/Schedule.js';
import { ReturnObject } from '../util/returnObject.js';
import { ObjectId } from 'mongodb';

export class ScheduleService {
  constructor() {}

  /**
   * Creates a user booking
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {ReturnType}
   */
  createSchedule = async (req, res) => {
    const { year, month, day, startTime, endTime } = req.body;

    try {
      if (!year || !month || !day || !startTime || !endTime) {
        const response = ReturnObject(
          false,
          'Schedule date argument is incomplete'
        );
        console.error('Error in request body: Missing a schedule argument');
        return res.status(400).send(response);
      }

      // Check that the schedule date has not already passed
      const currentDate = new Date();
      const scheduleDate = new Date(year, month - 1, day); // JS Date months are 0-indexed

      if (scheduleDate < currentDate.setHours(0, 0, 0, 0)) {
        const response = ReturnObject(false, 'Invalid schedule date');
        console.error('Error: Schedule date has already passed');
        return res.status(400).send(response);
      }

      // Create available slots (hourly from startTime to endTime)
      const availableSlots = this.generateAvailableSlots(startTime, endTime);

      // Create the schedule in the database
      const newSchedule = await ScheduleModel.create({
        year,
        month,
        day,
        startTime,
        endTime,
        availableSlots,
        bookings: []
      });

      const response = ReturnObject(true, newSchedule);
      return res.status(201).send(response); // 201 = Created
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while creating schedule'
      );
      console.error({ Error: error?.message || error });
      return res.status(500).send(response); // 500 for unexpected server errors
    }
  };

  /**
   * Update a schedule
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {ReturnType}
   */
  updateSchedule = async (req, res) => {
    const { scheduleId, year, month, day, startTime, endTime } = req.body;

    try {
      const scheduleToUpdate = await ScheduleModel.findById(scheduleId);
      if (!scheduleToUpdate) {
        const response = ReturnObject(false, 'Schedule not found');
        console.error({ Error: 'Failed to find the schedule to update' });
        return res.status(404).send(response);
      }
      const currentDate = new Date();

      if (year && year >= currentDate.getFullYear()) {
        scheduleToUpdate.year = year;
      }

      const currentMonth = currentDate.getMonth() + 1;

      if (month && month >= currentMonth) {
        scheduleToUpdate.month = month;
      }
      if (day && day >= currentDate.getDate()) {
        scheduleToUpdate.day = day;
      }

      //Update the available slots along with the start and end time
      const scheduleEnd = endTime ? endTime : scheduleToUpdate.endTime;
      const scheduleStart = startTime ? startTime : scheduleToUpdate.startTime;

      if (scheduleStart < scheduleEnd) {
        const availableSlots = this.generateAvailableSlots(
          scheduleStart,
          scheduleEnd
        );
        scheduleToUpdate.availableSlots = availableSlots;

        if (startTime) {
          scheduleToUpdate.startTime = startTime;
        }

        if (endTime) {
          scheduleToUpdate.endTime = endTime;
        }
      } else {
        const response = ReturnObject(
          false,
          `Invalid start time ${scheduleStart} and end time ${scheduleEnd}`
        );
        return res.status(400).send(response);
      }

      await scheduleToUpdate.save();
      const updated = await ScheduleModel.findById(scheduleToUpdate._id);
      if (!updated) {
        const response = ReturnObject(false, 'Updated schedule not found');
        console.error({ Error: 'Failed to find the updated schedule' });
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, updated);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while updating schedule'
      );
      console.error({ Error: error?.message || error });
      return res.status(500).send(response); // 500 for unexpected server errors
    }
  };

  /**
   * Delete a schedule
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {ReturnType}
   */
  deleteSchedule = async (req, res) => {
    try {
      const { scheduleId } = req.body;
      if (!scheduleId) {
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      const deletedSchedule = await ScheduleModel.deleteOne({
        _id: scheduleId
      });

      let response;
      if (!deletedSchedule.deletedCount) {
        response = ReturnObject(false, 'No schedule deleted');
      } else {
        response = ReturnObject(true, 'Schedule deleted successfully');
      }

      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while trying to delete schedule'
      );
      return res.status(500).send(response);
    }
  };

  /**
   * Delete a schedule
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {ReturnType}
   */
  getScheduleById = async (req, res) => {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) {
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      const schedule = await ScheduleModel.findById(scheduleId);
      if (!schedule) {
        response = ReturnObject(false, 'Schedule not found');
        return res.status(404).send(response);
      }

      response = ReturnObject(true, schedule);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while getting schedule'
      );
      return res.status(500).send(response);
    }
  };

  /**
   * Delete a schedule
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {ReturnType}
   */
  getAllSchedule = async (req, res) => {
    try {
      const allSchedule = await ScheduleModel.find();
      response = ReturnObject(true, allSchedule);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Something went wrong while getting all schedule'
      );
      return res.status(500).send(response);
    }
  };
  /**
   * Updates time slots after a schedule has been made
   * @param {String} scheduleId
   * @param {any} booking
   * @param {Collection<Document>} scheduleCollection
   * @param {import('mongoose').ClientSession} session
   * @returns {Promise<any>}
   */
  updateScheduleAfterBooking = async (
    scheduleId,
    booking,
    scheduleCollection,
    session
  ) => {
    try {
      console.log('Booking made, updating schedule');

      if (!scheduleId || !booking?._id || !booking?.duration) {
        throw new Error('Missing arguments');
      }

      const scheduleObjectId =
        typeof scheduleId === 'string' ? new ObjectId(scheduleId) : scheduleId;

      const scheduleToUpdate = await scheduleCollection.findOne(
        {
          _id: scheduleObjectId
        },
        { session }
      );

      if (!scheduleToUpdate) {
        throw new Error('Schedule to update was not found');
      }

      const bookingStartTime = booking.startTime;
      const bookingId = booking._id;
      const serviceDuration = booking.duration;

      const updatedSlots = this.updateAvailableSlotsAfterBooking(
        bookingStartTime,
        serviceDuration,
        scheduleToUpdate.availableSlots
      );

      // Perform the update using updateOne
      const updateResult = await scheduleCollection.updateOne(
        { _id: scheduleObjectId },
        {
          $set: { availableSlots: updatedSlots },
          $push: { bookings: bookingId }
        },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error('Failed to update schedule');
      }

      // Fetch and return the updated schedule
      const updatedSchedule = await scheduleCollection.findOne(
        {
          _id: scheduleObjectId
        },
        { session }
      );

      return updatedSchedule;
    } catch (error) {
      throw new Error(
        error?.message ??
          'Something went wrong while updating schedule after booking was made'
      );
    }
  };

  /**
   * Generates an array of Available slots in the format '10:00'
   * @param {Number} startTime
   * @param {Number} endTime
   * @returns {String[]} availableSlots
   */
  generateAvailableSlots = (startTime, endTime) => {
    try {
      const start = Number(startTime.split(':')[0]);
      const end = Number(endTime.split(':')[0]);
      const availableSlots = [startTime];

      let currentSlot = start;

      while (currentSlot < end - 1) {
        currentSlot += 1;

        // Reset to 0 at midnight
        if (currentSlot === 24) currentSlot = 0;
        let postfix = currentSlot < 12 ? 'am' : 'pm';
        let hour = currentSlot.toString().padStart(2, '0');
        availableSlots.push(`${hour}:00${postfix}`);
      }

      return availableSlots;
    } catch (error) {
      throw new Error(
        error?.message ??
          'Something went wrong while generating available slots'
      );
    }
  };

  /**
   * Removes booked time slots from the available list
   * @param {String} startTime - e.g., "10:00"
   * @param {Number} duration - in hours (e.g., 2 for 2 hours)
   * @param {String[]} availableSlots
   * @returns {String[]} newAvailableSlots
   */
  updateAvailableSlotsAfterBooking = (startTime, duration, availableSlots) => {
    try {
      const startHour = Number(startTime.split(':')[0]);
      const slotsToRemove = Math.ceil(Number(duration)); // Round up 6.5 → 7

      const blockedHours = new Set();
      for (let i = 0; i < slotsToRemove; i++) {
        blockedHours.add(startHour + i);
      }

      const newSlots = availableSlots.filter((slot) => {
        const slotHour = Number(slot.split(':')[0]);
        return !blockedHours.has(slotHour);
      });

      return newSlots;
    } catch (error) {
      throw new Error(
        error?.message ?? 'Something went wrong while updating available slots'
      );
    }
  };
}
