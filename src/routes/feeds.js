//IMPORTS SECTION-----------------------------------------------
const express = require('express')
const feedRoutes = express.Router();
const dbServices = require("../db/db.js");
const { feedPermissionsCheck, logInfo } = require('../helper/helper.js');
const { In } = require('typeorm');
const userTypes = require('../helper/constants.js');
//--------------------------------------------------------------


//ROUTES SECTION---------------------------------------------------
feedRoutes.get('/', async(req, res) => {
  try
  {
    let feedsList = req.decoded.feedsList;
    let responseList = await dbServices.findFeed(
      req.decoded.role === userTypes.super?{}:{
        where: {
            id: In([...feedsList]) ,
        }
    }
    );
    res.status(200).json({feeds:[...responseList]});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

feedRoutes.get('/:id', async(req, res) => {
  let id = req.params.id;
  try
  {
    let element = [...req.decoded.feedsList].find(x=>x==id)
    if(!element && req.decoded.role!==userTypes.super){
      throw Error("You do not have access to this feed.");
    }
    let responseList = await dbServices.findFeed({
        where: {
            id: id ,
        }
    });
    res.status(200).json({feeds:[...responseList]});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

feedRoutes.put('/:id', async(req, res) => {
  let id = req.params.id;
  let update = req.body;
  try
  {
    feedPermissionsCheck(req.decoded.role);
    let response = await dbServices.updateFeed(
      {
        id:id,
      },
      update
    );
    if(response.affected===0){
      throw Error("Feed not found")
    }
    logInfo(req.decoded.role+" "+req.decoded.name+" updated feed with ID: "+id)
    res.status(200).json({message:"Updated"});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

feedRoutes.post('/', async(req, res) => {
  let {name,url,description} = req.body;
  try
  {
    if(!!!name || !!!url || !!!description){
      throw Error("Feed details missing.");
    }
    feedPermissionsCheck(req.decoded.role);
    let response = await dbServices.createFeed({name,url,description});
    logInfo(req.decoded.role+" "+req.decoded.name+" created feed : "+JSON.stringify(response))
    res.status(200).json({message:"Feed created"});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

feedRoutes.delete('/:id', async(req, res) => {
  let id = req.params.id;
  try
  {
    feedPermissionsCheck(req.decoded.role,req.decoded.deleteFeedPermission);
    let element = [...req.decoded.feedsList].find(x=>x==id)
    if(!element && req.decoded.role!==userTypes.super){
      throw Error("You do not have access to this feed.");
    }
    let response = await dbServices.deleteFeed({id:id});
    if(response.affected===0){
      throw Error("Feed not found")
    }
    logInfo(req.decoded.role+" "+req.decoded.name+" deleted feed with ID: "+id)
    res.status(200).json({message:"Deleted"});
  } catch(error) {
    res.json({ message: "Error: "+error.message })
  }
})

//--------------------------------------------------------------

module.exports = feedRoutes