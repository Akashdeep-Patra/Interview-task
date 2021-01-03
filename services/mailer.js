const config = require('config')
const sgMail = require('@sendgrid/mail')
const schedule = require('node-schedule')
const Job = require('./../models/Job')
const sendGridApiKey = config.get("sendGridApiKey")
const runningJobs = require('./runningJobs')
sgMail.setApiKey(sendGridApiKey)
console.log("sendgrid API set");
const cancelJob = async (job) => {
    runningJobs[job._id].cancel(job.scheduleTime)
    console.log("job " + job._id + " cancelled");

}
const reSchedule = async (job) => {
    runningJobs[job._id].reschedule(job.scheduleTime)
    console.log("job " + job._id + " rescheduled");
}
const scheduleTask = async (job) => {
    const scheduledJob = schedule.scheduleJob(job.scheduleTime, async () => {
        const msg = {
            to: job.to,
            from: job.from,
            text: job.text,
            subject: job.subject,
            html: job.html,
        };
        try {
            await sgMail.send(msg);
            console.log("successfully mail sent");
            const jobToBeDeleted = await Job.findById(job._id)
            jobToBeDeleted.deleteOne()
            console.log("job deleted " + job._id);
        } catch (error) {
            console.error(error);
            const jobToBeUpdated = await Job.findById(job._id)
            jobToBeUpdated.status = 'failed'
            await jobToBeUpdated.save()
            if (error.response) {
                console.error(error.response.body)
            }
        }
    });
    console.log("job " + job._id + " schedulled");
    runningJobs[job._id] = scheduledJob
}

const scheduleAll = async () => {
    try {
        const jobs = await Job.find().sort({ date: -1 })
        jobs.forEach(job => {
            scheduleTask(job)
        })

    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { reSchedule, scheduleTask, scheduleAll, cancelJob }