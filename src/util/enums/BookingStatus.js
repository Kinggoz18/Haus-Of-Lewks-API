/**
 * @readonly
 * @enum
 */
const BookingStatus = Object.freeze({
  Upcoming: 'Upcoming',
  Completed: 'Completed',
  Missed: 'Missed',
  Cancelled: 'Cancelled'
});

const BookingStatusEnum = Object.values(BookingStatus);
export default BookingStatusEnum;
