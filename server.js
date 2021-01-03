const express = require('express')
const config = require('config')
const connectDB = require('./config/db')
const sendGridApiKey = config.get("sendGridApiKey")
const sgMail = require('@sendgrid/mail')
const PORT = process.env.PORT || 5000
//connecting to the api key
sgMail.setApiKey(sendGridApiKey)
console.log("sendgrid API set");

const app = express()

// connect mongoDB
connectDB()
// initializing middleware
app.use(express.json({ extended: false }))

//

// Define the routes

app.get('/', (req, res) => res.send('App running'))
app.use('/api/users', require('./routes/API/users'))
app.use('/api/profile', require('./routes/API/profile'))
app.use('/api/posts', require('./routes/API/posts'))
app.use('/api/auth', require('./routes/API/auth'))

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
