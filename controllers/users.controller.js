const HttpError = require('../models/HttpError')
const uuid = require('uuid/v4')
const {validationResult} = require('express-validator')

let DUMMY_USERS= [ {
          id: 'u1',
          name: 'Jack',
          email: 'jack@mail.com',
          password: 'jack123'
     },
     {
        id: 'u2',
        name: 'Mark',
        email: 'mark@mail.com',
        password: 'mark123'
   }
]

const getUsers = (req,res,next)=>{
   console.log('***/api/users/ route :')
   res.status(200).json({users : DUMMY_USERS})
}

const signUp = (req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        throw new HttpError("Input values not valid for this field -> "+errors.errors[0].param, 422)
    }
    const {name,email,password} = req.body
    const isExist = DUMMY_USERS.find(user=>user.email===email)
    if(isExist){
        return next(new HttpError(email + " User already exists..!",409))
    }
    const newUser={id: uuid(),
                   name,
                   email,
                   password 
                   }
    DUMMY_USERS.push(newUser)               
    res.status(201).json({user : newUser})
}

const login = (req,res,next)=>{
    const {email,password} = req.body
    const userExists = DUMMY_USERS.find(user=>user.email===email)
    if(!userExists || userExists.password!==password){
        return next(new HttpError("User login info is not right..!",401))
    }
    res.status(200).json(userExists)
}

module.exports={
                getUsers,
                signUp,
                login
               }