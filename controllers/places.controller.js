const HttpError = require('../models/HttpError')
const uuid = require('uuid/v4')
const {validationResult} = require('express-validator')
const {getCoordsForAddress} =require('../utils/location')
let DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      location: {
        lat: 40.7484474,
        lng: -73.9871516
      },
      address: '20 W 34th St, New York, NY 10001',
      creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Big Ben London',
        description: 'One of the reknown land mark of London and world!',
        location: {
          lat: 51.5007292,
          lng: -0.1268141
        },
        address: 'Westminster, London SW1A 0AA',
        creator: 'u1'
      }

  ];

  const getPlaceById= (req,res,next)=>{
   
    console.log("places-routes places get request -  pid :",req.params.pid)
    const places = DUMMY_PLACES.find(p=>p.id===req.params.pid)
        
    if(!places){
        throw new HttpError("No place found..!",404) // Not good for Aysync requests
    }
    res.json({places})
   
}

 const getPlacesByUserId = (req,res,next)=>{
    console.log("places-routes user get request - uid:",req.params.uid)
    const user = DUMMY_PLACES.filter(p=>p.creator===req.params.uid)
    if(!user.length){
        return next(new HttpError("No user found..!",404))  //Best for Asynchronous request
    }
    res.json({user})
}

const createPlace = async (req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError("Input values not valid for this field -> "+errors.errors[0].param, 422)
    }
    const {title,description,address,creator} = req.body
   let coordinates;
    try{
        coordinates =await getCoordsForAddress(address)
        console.log('**** coordinates :',coordinates)
   }catch(error){
       return next(error)
   }   
    console.log("Create place - req.body:",req.body)
    const newPlace ={id:uuid(),
                    title,
                    description,
                    location:coordinates,
                    address,
                    creator}
    DUMMY_PLACES.push(newPlace)
    res.status(201).json({places:newPlace})
}

const updatePlace = (req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError("Input values not valid for this field -> "+errors.errors[0].param, 422)
    }
    const id = req.params.pid
    const placeIdx = DUMMY_PLACES.findIndex(p=>p.id===id)
    if(placeIdx===-1){
        throw new HttpError("Invalid place ID..!! ", 404)
    }
    const {title,description} = req.body
    
    console.log("Update place - req.body:",req.body)
    console.log('*****updatePlace -  place ****',placeIdx)
    DUMMY_PLACES[placeIdx].title=title
    DUMMY_PLACES[placeIdx].description=description
    res.status(201).json({places: DUMMY_PLACES})
}

const deletePlace = (req,res,next)=>{
    let pid = req.params.pid
    if(!DUMMY_PLACES.find(p=>p.id===pid)){
        throw new HttpError("Place not Found..!",404)
    }
    DUMMY_PLACES =DUMMY_PLACES.filter(p => p.id!==pid)
    // const placeIdx = DUMMY_PLACES.findIndex(p=>p.id===pid)
    // DUMMY_PLACES.splice(placeIdx,1)
     console.log('*****deletePlace -  pid ****',pid)
    res.status(200).json({places: DUMMY_PLACES})
}
module.exports ={ getPlaceById, 
                  getPlacesByUserId ,
                  createPlace, 
                  updatePlace, 
                  deletePlace
                }

