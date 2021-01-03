const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const Job = require('./../../models/Job')
const { scheduleTask, reSchedule, cancelJob } = require('./../../services/mailer')
//runtime variable to keep track of the running jobs

//to get all the scheduled jobs from
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ date: -1 })
        res.json(jobs)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'Server error' })
    }
})

//to get all the failed jobs from
//route /jobs/failed
router.get('/failed', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'failed' })
        res.json(jobs)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'Server error' })
    }
})


// Route    get api/jobs/:id
// desc       get the job by job-id
// acess    public

router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
        if (!job) return res.status(404).json({ message: 'Post not found' })
        res.json(job)
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Job not found' })
        res.status(500).json({ message: 'Server error' })
    }
})


// Route    post  api/jobs
// desc     posts a job from the api
// acess    public

router.post('/', [check('text', 'Text is required').not().isEmpty(),
check('to', 'To is required').not().isEmpty(),
check('from', 'From is required').not().isEmpty()], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const scheduleTime = req.body.scheduleTime ? req.body.scheduleTime : Date.now()
    try {
        const tempObj = {
            to: req.body.to,
            from: req.body.from,
            text: req.body.text,
            subject: req.body.subject,
            html: req.body.html,
            scheduleTime: scheduleTime
        }
        //new job variable
        const newJob = Job(tempObj)
        const savedJob = await newJob.save()
        scheduleTask(savedJob)
        res.json(savedJob)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'Server error' })
    }
})

// Route    delete api/jobs/:id
// desc       delete a jobs by id
// acess    private

router.delete('/:id', async (req, res) => {
    try {
        // get the post by the current user and the given post id
        const job = await Job.findOne({ _id: req.params.id })
        if (!job) return res.status(404).json({ message: 'Job not Found' })
        cancelJob(job)
        job.delete()
        res.json({ message: 'Job removed' })
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Job not found' })
        res.status(500).json({ message: 'Server error' })
    }
})



// Route    edits api/jobs/:id
// desc       edits a job by id
// acess    public

router.put('/:id', async (req, res) => {
    try {
        // get the job by  the given job id
        const job = await Job.findOne({ _id: req.params.id })
        if (!job) return res.status(404).json({ message: 'Job not Found' })
        job.to = req.body.to
        job.from = req.body.from
        job.text = req.body.text
        job.subject = req.body.subject
        job.html = req.body.html
        job.scheduleTime = req.body.scheduleTime
        const newJob = await job.save()
        reSchedule(newJob)
        res.json(newJob)
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Job not found' })
        res.status(500).json({ message: 'Server error' })
    }
})











module.exports = router