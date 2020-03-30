require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const placesRoutes = require('./routes/places-routes')
const userRoutes = require ('./routes/user-routes')
const HttpError = require('./models/HttpError')
const mongoose = require('mongoose')

const app = express();
app.use(bodyParser.json())

// User Routes
app.use('/api/users/',userRoutes)

/* 1-Now place routes includes as a middleware in app.js. 
   2- Also first arugment, you can use it as base argument */
app.use('/api/places',placesRoutes)


/* Handling any Invalid Route Request */
app.use((req,res,next)=>{
    throw new HttpError("NOT A VALID ROUTE..!!",404)
})

/* Error middleware to check any Errors thrown in any of routes */
app.use((error,req,res,next)=>{
 
    if(req.headerSent){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message : error.message || "An unkown error has occurred..!!" })
})

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-qu7hx.mongodb.net/places_db?retryWrites=true&w=majority`)
 .then(()=>{
    console.log('DB Connection Successfull..!!') 
    app.listen(5000)
    console.log('Server Connection Successfull..!!') 
 })
 .catch(error=>{
    throw new HttpError('Connection Failed..!!',500)
 })
