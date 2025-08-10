import schedule from 'node-schedule';
import CronJob from '../models/CronJobs.js';

/**
 * Restart cron jobs when the server restarts
 */
const restartCronJobs = async () => {
  console.log('Checking cron jobs...');
  const allJobs = await CronJob.find();

  for (const job of allJobs) {
    const jobDate = new Date(job.jobDateTime);
    const jobType = job.jobType;
    const jobName = job.name;

    if (jobDate < new Date()) {
      //Run missed jobs
      try {
        console.log('Running missed cron job:', jobName);
      } catch (err) {
        console.error(`Failed to resume cron job for ${jobName}:`, err);
      }
    } else {
      console.log('Resuming cron job:', jobName);
      schedule.scheduleJob(jobName, jobDate, async () => {
        try {
        } catch (err) {
          console.error(`Failed to resume cron job for ${jobName}:`, err);
        }
      });
    }
  }
};

/**
 * Cancel cron jobs
 * @param {*} jobName
 */
const cancelCronJob = async (jobName) => {
  var jobToCancel = schedule.scheduledJobs[jobName];

  if (jobToCancel) {
    //Delete the job from the database and cancel it
    await CronJob.deleteOne({ name: jobName });
    jobToCancel.cancel();

    console.log(`Job canceled: ${jobName}`);
  }
};

/**
 * Start a cron job
 * @param {*} jobType The type of cronjob
 * @param {*} callback Callback arrow function
 */
const startCronJob = async (jobType, jobDateTime, callback, ...args) => {
  console.log('Scheduling cron job...');
};

export { restartCronJobs, cancelCronJob, startCronJob };
