const mongoose = require('mongoose')
require('mongoose-function')(mongoose)
const Schema = mongoose.Schema
const JobSchema = new Schema({
    status: {
        type: String,
        default: "scheduled"
    },
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
