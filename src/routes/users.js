//IMPORTS SECTION-----------------------------------------------
const express = require('express')
const userRoutes = express.Router();
const dbServices = require("../db/db.js");
const userTypes = require('../helper/constants.js');
const { userPermissionCheck, logInfo, encryptPassword } = require('../helper/helper.js');
const { In } = require('typeorm');
//--------------------------------------------------------------


//API SECTION---------------------------------------------------

userRoutes.get('/', async(req, res) => {
  try
  {
    let userTypeList = [];
    switch (req.decoded.role) {
      case userTypes.super:
        userTypeList = [userTypes.admin,userTypes.basic];
        break;
      case userTypes.admin:
        userTypeList = [userTypes.basic];
        break;
      default:
        userTypeList = [null];
        break;
    }
    let responseList = await dbServices.findUser({
        select: {
          "id": true,
          "name": true,
          "role": true,
          "email": true,
          "password": false,
          "feedsList": true,
          "deleteFeedPermission": true
        },
        where: 
        [
          {role: In([...userTypeList])},
          {id: req.decoded.id},
        ]
    });
    res.status(200).json({users:[...responseList]});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

userRoutes.get('/:id', async(req, res) => {
  let id = req.params.id;
  try
  {
    let responseList = await dbServices.findUser({
      select: {
        "id": true,
        "name": true,
        "role": true,
        "email": true,
        "password": false,
        "feedsList": true,
        "deleteFeedPermission": true
      },
        where: {
            id: id ,
        }
    });
    if(
      req.decoded.id == id || req.decoded.role===userTypes.super || 
      (req.decoded.role===userTypes.admin && responseList[0].role===userTypes.basic)
      ){
        res.status(200).json({users:[...responseList]});
    }
    else{
      throw Error("You do not have access to view this user.");
    }
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

userRoutes.put('/:id', async(req, res) => {
  let id = req.params.id;
  let update = req.body;
  try
  {
    userPermissionCheck(req.decoded.role)
    let response = await dbServices.updateUser(
      {
        id:id,
        role: In(req.decoded.role === userTypes.super ? [userTypes.admin,userTypes.basic]:[userTypes.basic])
      },
      update
    );
    if(response.affected===0){
      throw Error("Either user was not found or you do not have access to update this user.")
    }
    logInfo(req.decoded.role+" "+req.decoded.name+" updated user with ID: "+id)
    res.status(200).json({message:"Updated"});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

userRoutes.post('/', async(req, res) => {
  let {name,email,password,role,feedsList,deleteFeedPermission} = {...req.body};
  try
  {
    userPermissionCheck(req.decoded.role);
    if(!!!name || !!!email || !!!password || !!!feedsList || !!!role){
      throw Error("User details missing.");
    }
    password = await encryptPassword(password);
    deleteFeedPermission = req.decoded.role === userTypes.super? (deleteFeedPermission || false) : false;
    role = req.decoded.role === userTypes.super ? (role==="admin"?userTypes.admin:userTypes.basic) : userTypes.basic;
    feedsList = typeof(feedsList)===typeof([])?feedsList:[];
    let response = await dbServices.createUser({name,email,password,role,feedsList,deleteFeedPermission});
    logInfo(req.decoded.role+" "+req.decoded.name+" created user: "+JSON.stringify(response[0]))
    res.status(200).json({message:"User created"});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

userRoutes.post('/feed-access/:id', async(req, res) => {
  let {feedId} = req.body;
  let id = req.params.id;
  if(!feedId){
    throw Error("feedId not provided");
  }
  try
  {
    userPermissionCheck(req.decoded.role);
    let allowedFeeds = req.decoded.feedsList;
    if(![...allowedFeeds].find(x=>x===feedId)){
      throw Error("You do not have access to this feed.")
    }
    let response = await dbServices.updateUser(
      {
        id:id,
        role: req.decoded.role === userTypes.super ? In([userTypes.admin,userTypes.basic]) : userTypes.basic
      },
      {
        feedsList: () => `array_append("feedsList", ${feedId})`
      }
    );
    logInfo(req.decoded.role+" "+req.decoded.name+" gave access feed "+feedId+" access to user with ID: "+id)
    res.status(200).json({message:"Feed access granted."});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

userRoutes.delete('/:id', async(req, res) => {
  let id = req.params.id;
  try
  {
    userPermissionCheck(req.decoded.role)
    let response = await dbServices.deleteUser(
      {
        id:id,
        role: In(req.decoded.role === userTypes.super ? [userTypes.admin,userTypes.basic]:[userTypes.basic])
      }
    );
    if(response.affected===0){
      throw Error("Either user was not found or you do not have access to delete this user.")
    }
    logInfo(req.decoded.role+" "+req.decoded.name+" deleted user with ID: "+id)
    res.status(200).json({message:"User Deleted."});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})
//--------------------------------------------------------------

module.exports = userRoutes