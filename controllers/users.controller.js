const HttpError = require('../models/HttpError')
const uuid = require('uuid/v4')
const {validationResult} = require('express-validator')
const User = require('../models/user.model')

const getUsers = async (req,res,next)=>{
   console.log('***/api/users/ route :')
   let usersList;
   try{
     usersList = await User.find({},'-password')
     console.log('*** userExists :',usersList)
      if(!usersList.length){
          return next(new HttpError("No user exists..!",409))
      }
  }catch(error){
      return next(new HttpError("Users can not be searched in DB..!",500))
  }
   res.status(200).json({users : usersList.map(user=>user.toObject({getters:true}))})
}

const signUp = async(req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError("Input values not valid for this field -> "+errors.errors[0].param, 422)
    }
    const {name,email,password} = req.body
    // const isExist = DUMMY_USERS.find(user=>user.email===email)
    
    try{
      const  userExists = await User.find({email:email})
      console.log('*** userExists :',userExists)
        if(userExists.length){
            return next(new HttpError("User already exists..!",409))
        }
    }catch(error){
        return next(new HttpError(email + " can not be searched in DB..!",500))
    }
    let user = new User({
        name, email, password,
        image : 'http://res.cloudinary.com/dv4nqc4ci/image/upload/v1584543091/samples/animals/kitten-playing.gif',
        places : []
    });

    try{
         await user.save()  
         console.log('*** user saved :',user)
    }catch(error){
        return next(new HttpError("User record is not saved in DB..!",500))
    }
              
    res.status(201).json({users: user.toObject({getters:true})})
}

const login = async (req,res,next)=>{
    const {email,password} = req.body
    let loginUser;
    try{
         loginUser = await User.find({email: email})
        console.log('*** loginUser :',loginUser)
    }catch(error){
        return next(new HttpError(email + " can not be searched in DB..!",500))
    }
    if(!loginUser.length || loginUser[0].password!==password){
        return next(new HttpError("User login info is not matching..!",401))
    }
    res.status(200).json({users : loginUser.map(user=>user.toObject({getters:true}))})
}

module.exports={
                getUsers,
                signUp,
                login
               }