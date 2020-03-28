const apiKey = require('./utils')
const axios = require('axios')
const HttpError = require('../models/HttpError')

const getCoordsForAddress= async (address)=>{
    console.log('API Key : ',apiKey.API_KEY)
  const response = await  axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey.API_KEY}`)
   const data = response.data
  if(!data || data.status ==='ZERO_RESULTS'){
     throw new HttpError("No map results.!!",404)
  }
  const coordinates = data.results[0].geometry.location
  return coordinates
}
module.exports ={ getCoordsForAddress}