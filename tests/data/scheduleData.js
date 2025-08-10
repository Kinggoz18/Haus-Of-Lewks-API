const septemberSchedules = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const dayString = day.toString().padStart(2, '0'); // e.g., "01", "02", ..., "31"

  return {
    year: '2025',
    month: 'September',
    day: dayString,
    startTime: '10:00am',
    endTime: '18:00pm'
  };
});

export default septemberSchedules;
