import { DigitalOceanSpacesManger } from './DigitalOceanService.js';

export class MediaService {
  /**
   *
   * @param {DigitalOceanSpacesManger} spacesManager
   */
  constructor(spacesManager) {
    this.spacesManager = spacesManager;
  }
}
