/**
 * @typedef {Object} ResponseType
 * @property {boolean} isSuccess
 * @property {*} content
 */

/**
 * @param {boolean} isSuccess
 * @param {*} content
 * @returns {ResponseType}
 */
const ReturnObject = (isSuccess, content) => {
  return {
    isSuccess: isSuccess,
    content: content
  };
};

export { ReturnObject };
