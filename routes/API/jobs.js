const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const Jobs = require('./../../models/Job')
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
    try {
        //new job variable
        const newJob = Post({
            to: req.body.to,
            from: req.body.from,
            text: req.body.text,
            subject: req.body.subject,
            html: req.body.html,
            scheduleTime: req.body.scheduleTime
        })

        const savedPost = await newJob.save()
        res.json(savedPost)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'Server error' })
    }
})