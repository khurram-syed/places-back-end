const HttpError = require('../models/HttpError')
const {validationResult} = require('express-validator')
const {getCoordsForAddress} =require('../utils/location')
const Place = require ('../models/place.model')
const User = require('../models/user.model')
const mongoose = require('mongoose')


  const getPlaceById= async (req,res,next)=>{
   
    console.log("places-routes places get request -  pid :",req.params.pid)
    // const places = DUMMY_PLACES.find(p=>p.id===req.params.pid)
    let place;
    try{ 
        place = await Place.findById(req.params.pid)
    }catch(err){
        return next(new HttpError('Something Wrong with DB GET..!',500))
    }   
    if(!place){
        return next(new HttpError("No place found for provided Id..!",404))// Not good for Aysync requests
    }
    res.json({place: place.toObject({getters:true})})
}

 const getPlacesByUserId = async (req,res,next)=>{
    console.log("places-routes user get request - uid:",req.params.uid)
    //const user = DUMMY_PLACES.filter(p=>p.creator===req.params.uid)
    let userPlaces;
    try{
        userPlaces = await Place.find({creator:req.params.uid}) 
        console.log('userPlaces :',userPlaces)
    }catch(err){
        return next(new HttpError('Something Wrong with DB GET..!',500))
    } 
    
    if(!userPlaces.length){
        return next(new HttpError("No user found..!",404))  //Best for Asynchronous request
    }

    res.json({places :userPlaces.map(place=>place.toObject({getters:true})) })
}

const createPlace = async (req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError("Input values not valid for this field -> "+errors.errors[0].param, 422)
    }
    const {title,description,address,creator} = req.body
    let user;
    try{
        user =await User.findById(creator)
        if(!user){
            return next( new HttpError("User not found..! ", 404))
        }
        console.log('**** user :',user)
   }catch(error){
       return next(error)
   }   
    let coordinates;
    try{
        coordinates =await getCoordsForAddress(address)
        console.log('**** coordinates :',coordinates)
   }catch(error){
       return next(error)
   }   
    console.log("Create place - req.body:",req.body)
    const newPlace = new Place({
          title, description, address,
          location: coordinates,
          image : 'https://res.cloudinary.com/dv4nqc4ci/image/upload/v1584546056/places/Bigban_oxcdl5.jpg',
          creator
    })
    console.log("Create place - newPlace:",newPlace)
    try{const sess = await mongoose.startSession();
        sess.startTransaction();
        await newPlace.save({session:sess})
        user.places.push(newPlace)
        await user.save({session:sess})
        await sess.commitTransaction()
       console.log('Record Saved..!!')
    }catch(error){
       return next(new HttpError('Could not Save Place in DB..!',500))
    }
    // DUMMY_PLACES.push(newPlace)
    res.status(201).json({places:newPlace.toObject({getters:true})})
}

const updatePlace = async(req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError("Input values not valid for this field -> "+errors.errors[0].param, 422)
    }
    const id = req.params.pid
    const {title,description} = req.body
    let place;
    try{ 
        place = await Place.findById(req.params.pid)
        place.title = title;
        place.description = description
        await place.save()
    }catch(err){
        return next(new HttpError('Something Wrong with DB Update.!',500))
    }   
    res.status(201).json({places: place.toObject({getters:true})})
}

const deletePlace = async(req,res,next)=>{
    let pid = req.params.pid
     console.log('*****deletePlace -  pid ****',pid)
    let place;
    try{
        place = await Place.findById(pid).populate('creator')
        if(!place){
            return next(new HttpError('PID not found error in DB..!',500))
        }
    }catch(error){
        return next(new HttpError('PID Search error in DB..!',500))
    }
    
   try{ 
       const sess = await mongoose.startSession()
       sess.startTransaction()
       await place.remove({session: sess})
       place.creator.places.pull(place)
       await place.creator.save({session : sess})
       await sess.commitTransaction()
    }catch(error){
        return next(new HttpError('Place Not Deleted in DB..!',500))
    }
    console.log('*** place :',place)
    res.status(200).json({places: place})
}
module.exports ={ getPlaceById, 
                  getPlacesByUserId ,
                  createPlace, 
                  updatePlace, 
                  deletePlace
                }

