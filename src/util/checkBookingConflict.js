import dayjs from 'dayjs';
import BookingModel from '../models/Bookings.js';

/**
 * Checks if a booking has conflicts before creating the booking
 * @param {import('mongoose').ObjectId} scheduleId The selected selected schedule id
 * @param {Date} proposedStart The start time of the booking
 * @param {Number} duration The duration of the hair service in milliseconds
 * @returns
 */
const doesConflictExist = async (scheduleId, proposedStart, duration) => {
  const proposedStartTime = dayjs(proposedStart); // full Date object
  const proposedEndTime = proposedStartTime.add(duration, 'milliseconds');

  const now = dayjs();

  // Only fetch bookings on the same schedule that start now or later
  const bookings = await BookingModel.find({
    scheduleId,
    startTime: { $gte: now.toDate() }
  });

  return bookings.some((b) => {
    const existingStart = dayjs(b.startTime);
    const existingEnd = existingStart.add(b.service.duration, 'milliseconds');
    return (
      proposedStartTime.isBefore(existingEnd) &&
      proposedEndTime.isAfter(existingStart)
    );
  });
};
