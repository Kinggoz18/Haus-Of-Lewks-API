import HairServicesModel from '../models/HairServices.js';
import ScheduleModel from '../models/Schedule.js';
import { ReturnObject } from '../util/returnObject.js';

export class HairServices {
  constructor() {}

  /**
   * Get booking by id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  addHairService = async (req, res) => {
    const { title, price, imageLink, category, duration, addOns } = req.body;

    if (!title) {
      const response = ReturnObject(false, 'Hair service title is required');
      return res.status(400).send(response);
    }
    if (!price) {
      const response = ReturnObject(false, 'Hair service price is required');
      return res.status(400).send(response);
    }
    if (!imageLink) {
      const response = ReturnObject(false, 'Hair service image is required');
      return res.status(400).send(response);
    }
    if (!category) {
      const response = ReturnObject(false, 'Hair service category is required');
      return res.status(400).send(response);
    }
    if (!duration) {
      const response = ReturnObject(false, 'Hair service duration is required');
      return res.status(400).send(response);
    }

    try {
      const newService = await HairServicesModel.create({
        title,
        price,
        imageLink,
        category,
        addOns: addOns ?? [],
        duration
      });

      const response = ReturnObject(true, newService);
      return res.status(201).send(response);
    } catch (error) {
      console.log({ error });
      const response = ReturnObject(
        false,
        'Something went wrong while adding new hair service'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get booking by id
   * TODO: This should be a protected route. Add validate request here
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  removeHairService = async (req, res) => {
    const { id } = req.params;
    try {
      await HairServicesModel.deleteOne({ _id: id });
      const response = ReturnObject(true, 'Hair service removed');
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while removing hair service'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Update a hair service by id
   * TODO: This should be a protected route. Add validate request here
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateHairService = async (req, res) => {
    const { id, title, price, imageLink, category, addOns, duration } =
      req.body;

    try {
      const serviceToUpdate = await HairServicesModel.findById(id);
      if (!serviceToUpdate) {
        const response = ReturnObject(false, 'Hair service was not found');
        return res.status(404).send(response);
      }

      //Update the supplied fields
      serviceToUpdate.title = title ?? serviceToUpdate.title;
      serviceToUpdate.price = price ?? serviceToUpdate.price;
      serviceToUpdate.imageLink = imageLink ?? serviceToUpdate.imageLink;
      serviceToUpdate.category = category ?? serviceToUpdate.category;
      serviceToUpdate.addOns = addOns ?? serviceToUpdate.addOns;
      serviceToUpdate.duration = duration ?? serviceToUpdate.duration;

      await serviceToUpdate.save();

      const updatedService = await HairServicesModel.findById(id);
      if (!updatedService) {
        const response = ReturnObject(
          false,
          'Updated hair service was not found'
        );
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, updatedService);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while updating hair service'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Returns an object grouped by hair service category
   * //TODO: This should be a protected route. Add validate request here
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getServicesByCategory = async (req, res) => {
    try {
      const hairServices = await HairServicesModel.find();
      const groupedServices = {};

      hairServices.forEach((service) => {
        const category = service.category;
        if (!groupedServices[category]) {
          groupedServices[category] = [];
        }
        groupedServices[category].push(service);
      });

      const response = ReturnObject(true, groupedServices);
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while getting hair service by category'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Returns all available Hair services for the selected schedule
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getAvailableHairServicesForSchedule = async (req, res) => {
    const { scheduleId, startTime } = req.body;
    try {
      const selectedSchedule = await ScheduleModel.findById(scheduleId);
      if (!selectedSchedule) {
        const response = ReturnObject(false, 'Schedule not found');
        return res.status(404).send(response);
      }

      const allHairServices = await HairServicesModel.find();
      const availableServices = {};

      //Get the available slots from the start time selected
      const availableSlots = this.getSlotsAfterStartTime(
        selectedSchedule.availableSlots,
        startTime
      );

      //Get the shortest and longest hours available in the schedule
      const longestConsecutive = this.getLongestConsecutiveTime(availableSlots);

      //Return only the ones that can be completed in the time frame
      allHairServices.forEach((service) => {
        if (service.duration <= longestConsecutive) {
          if (!availableServices[service.category]) {
            availableServices[service.category] = [];
          }

          availableServices[service.category].push(service);
        }
      });

      const response = ReturnObject(true, availableServices);
      return res.status(200).send(response);
    } catch (error) {
      console.error(
        `getAvailableHairServicesForSchedule Error:  ${error?.message ?? error}`
      );
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while getting available hair services'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Gets the longest hour duration from the available time slots
   * @param {string[]} availableSlots
   * @returns
   */
  getLongestConsecutiveTime = (availableSlots) => {
    if (availableSlots.length === 0) {
      return 0;
    }

    if (availableSlots.length === 1) {
      return 1;
    }

    let longestConsecutive = 1;

    let currentCount = 1;

    for (let i = 1; i < availableSlots.length; i++) {
      const prevHour = Number(availableSlots[i - 1].split(':')[0]);
      const currentHour = Number(availableSlots[i].split(':')[0]);

      if (currentHour - prevHour === 1) {
        currentCount++;
      } else {
        // End of consecutive block
        if (currentCount > 1) {
          longestConsecutive = Math.max(longestConsecutive, currentCount);
        }
        currentCount = 1; // reset count
      }
    }

    // Final check in case the last items were consecutive
    if (currentCount > 1) {
      longestConsecutive = Math.max(longestConsecutive, currentCount);
    }

    return longestConsecutive;
  };

  /**
   * Returns all slots after the given startTime (hour only)
   * @param {string[]} slots - Array of times in "HH:mm" format
   * @param {string} startTime - The starting time in "HH:mm" format
   * @returns {string[]} Filtered array of slots after startTime hour
   */
  getSlotsAfterStartTime(slots, startTime) {
    const startHour = Number(startTime.split(':')[0]);

    return slots.filter((slot) => {
      const slotHour = Number(slot.split(':')[0]);
      return slotHour >= startHour;
    });
  }
}
