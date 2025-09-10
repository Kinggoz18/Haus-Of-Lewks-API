import CategoryModel from '../models/HairCategory.js';
import HairServicesModel from '../models/HairServices.js';
import ScheduleModel from '../models/Schedule.js';
import AddOnsModel from '../models/ServiceAddOns.js';
import { ReturnObject } from '../util/returnObject.js';
import { DigitalOceanSpacesManager } from './DigitalOceanService.js';

export class HairServices {
  /**
   * Default constructor
   * @param {DigitalOceanSpacesManager} spacesManager
   */
  constructor(spacesManager) {
    this.spacesManager = spacesManager;
  }

  /**
   * Add a hair service
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  addHairService = async (req, res) => {
    const { title, price, category, duration } = req.body;

    if (!title) {
      const response = ReturnObject(false, 'Hair service title is required');
      return res.status(400).send(response);
    }
    if (!price) {
      const response = ReturnObject(false, 'Hair service price is required');
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
        category,
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
   * Add a category
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  addCategory = async (req, res) => {
    const file = req?.file;
    const { title } = req.body;

    if (!file) {
      const response = ReturnObject(false, 'File is missing');
      return res.status(400).send(response);
    }

    if (!title) {
      const response = ReturnObject(false, 'Hair service title is required');
      return res.status(400).send(response);
    }

    try {
      const check = await CategoryModel.findOne({ title: title });
      if (check) {
        const response = ReturnObject(false, 'Category already exists');
        return res.status(400).send(response);
      }

      const coverLink = await this.spacesManager.uploadImage(file?.buffer);
      const newCategory = await CategoryModel.create({
        title,
        coverLink
      });

      const response = ReturnObject(true, newCategory);
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
   * Add an add on
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  addAddOn = async (req, res) => {
    const { title, price, service, duration } = req.body;

    if (!title) {
      const response = ReturnObject(false, 'Add on title is required');
      return res.status(400).send(response);
    }
    if (!price) {
      const response = ReturnObject(false, 'Add on price is required');
      return res.status(400).send(response);
    }
    if (!duration) {
      const response = ReturnObject(false, 'Add on duration is required');
      return res.status(400).send(response);
    }

    try {
      const newAddon = await AddOnsModel.create({
        title,
        price,
        service,
        duration
      });

      const response = ReturnObject(true, newAddon);
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
   * Remove a category
   * @param {*} req
   * @param {*} res
   * @returns
   */
  removeCategory = async (req, res) => {
    const { id } = req.params;
    try {
      if (!id) {
        const response = ReturnObject(false, 'Invalid request argument');
        return res.status(400).send(response);
      }

      //Check the category exists
      const categoryToDelete = await CategoryModel.findById(id);
      if (!categoryToDelete) {
        const response = ReturnObject(false, 'Media not found');
        return res.status(404).send(response);
      }

      //Delete the coverLink, the hair services and the category
      await this.spacesManager.deleteSingleResource(
        categoryToDelete?.coverLink
      );
      await HairServicesModel.deleteMany({ category: categoryToDelete?.title });
      await CategoryModel.deleteOne({ _id: categoryToDelete?._id });

      const response = ReturnObject(true, 'deleted');
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
   * Remove an add on
   * @param {*} req
   * @param {*} res
   * @returns
   */
  removeAddon = async (req, res) => {
    const { id } = req.params;
    try {
      await AddOnsModel.deleteOne({ _id: id });
      const response = ReturnObject(true, 'deleted');
      return res.status(200).send(response);
    } catch (error) {
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while trying to remove add on'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Get booking by id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  removeHairService = async (req, res) => {
    const { id } = req.params;
    try {
      await HairServicesModel.deleteOne({ _id: id });
      const response = ReturnObject(true, 'deleted');
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
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateHairService = async (req, res) => {
    const { id, title, price, category, duration } = req.body;

    try {
      const serviceToUpdate = await HairServicesModel.findById(id);
      if (!serviceToUpdate) {
        const response = ReturnObject(false, 'Hair service was not found');
        return res.status(404).send(response);
      }

      // Update the addons
      if (title && serviceToUpdate.title !== title) {
        const addonsToUpdate = await AddOnsModel.find({
          service: serviceToUpdate.title // old title
        });

        await Promise.all(
          addonsToUpdate.map(async (element) => {
            element.price = element.price;
            element.duration = element.duration;
            element.title = element.title;
            element.service = title;
            await element.save();
          })
        );
      }

      //Update the supplied fields
      serviceToUpdate.title = title ?? serviceToUpdate.title;
      serviceToUpdate.price = price ?? serviceToUpdate.price;
      serviceToUpdate.category = category ?? serviceToUpdate.category;
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
      console.log({ Error: error?.message ?? error });
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while updating hair service'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Update a category by id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateCategory = async (req, res) => {
    const file = req?.file;
    const { id, title } = req.body;

    try {
      console.log({ id });
      if (!id) {
        const response = ReturnObject(false, 'Invalid request arguemnt');
        return res.status(404).send(response);
      }

      const categoryToUpdate = await CategoryModel.findById(id);
      if (!categoryToUpdate) {
        const response = ReturnObject(false, 'Category not found');
        return res.status(404).send(response);
      }

      const servicesToUpdate = await HairServicesModel.find({
        category: categoryToUpdate.title // old title
      });

      // Update the title
      if (title && categoryToUpdate.title !== title) {
        await Promise.all(
          servicesToUpdate.map(async (element) => {
            element.price = element.price;
            element.duration = element.duration;
            element.title = element.title;
            element.category = title;
            await element.save();
          })
        );
      }

      let newCoverLink = null;
      // Update the cover link if file is provided
      if (file) {
        //Delete the previous image
        await this.spacesManager.deleteSingleResource(
          categoryToUpdate.coverLink
        );

        //Upload the new image
        newCoverLink = await this.spacesManager.uploadImage(file?.buffer);
      }

      categoryToUpdate.title = title ?? categoryToUpdate.title;
      categoryToUpdate.coverLink = newCoverLink ?? categoryToUpdate?.coverLink;

      await categoryToUpdate.save();

      const updatedService = await CategoryModel.findById(id);
      if (!updatedService) {
        const response = ReturnObject(false, 'Updated category was not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, updatedService);
      return res.status(200).send(response);
    } catch (error) {
      console.error({ Error: error?.message ?? error });
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while updating hair service'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Update an addon by id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateAddon = async (req, res) => {
    const { id, title, price, duration, service } = req.body;

    try {
      const addOnToUpdate = await AddOnsModel.findById(id);
      if (!addOnToUpdate) {
        const response = ReturnObject(false, 'Addon not found');
        return res.status(404).send(response);
      }

      //Update the supplied fields
      addOnToUpdate.title = title ?? addOnToUpdate.title;
      addOnToUpdate.price = price ?? addOnToUpdate.price;
      addOnToUpdate.duration = duration ?? addOnToUpdate.duration;
      addOnToUpdate.service = service ?? addOnToUpdate.service;

      await addOnToUpdate.save();

      const updatedService = await AddOnsModel.findById(id);
      if (!updatedService) {
        const response = ReturnObject(
          false,
          'Updated addon service was not found'
        );
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, updatedService);
      return res.status(200).send(response);
    } catch (error) {
      console.log({ Error: error?.message ?? error });
      const response = ReturnObject(
        false,
        'Sorry, something went wrong while updating hair service'
      );
      return res.status(400).send(response);
    }
  };

  /**
   * Returns an object grouped by hair service category
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
   * Get all categories
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getCategories = async (req, res) => {
    try {
      const categories = await CategoryModel.find();
      const response = ReturnObject(true, categories);
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
   * Get all add ons
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getAddons = async (req, res) => {
    try {
      const addOns = await AddOnsModel.find();
      const response = ReturnObject(true, addOns);
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
        console.log({ ServiceDuration: service?.duration });
        if (service.duration <= longestConsecutive) {
          if (!availableServices[service.category]) {
            availableServices[service.category] = [];
          }

          availableServices[service.category].push(service);
        }
      });

      console.log({
        startTime,
        longestConsecutive,
        availableSlots
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
        return longestConsecutive;
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
