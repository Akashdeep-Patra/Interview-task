const mongoose = require('mongoose')
const Schema = mongoose.Schema

const JobSchema = new Schema({
    to: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    subject: {
        type: String
    },
    html: {
        type: String
    },
    scheduleTime: {
        type: Date,
        default: Date.now
    }
})

module.exports = Post = mongoose.model('job', JobSchema)
