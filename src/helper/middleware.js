let jwt = require("jsonwebtoken");
const { findUser } = require("../db/db");

const authenticate = async(req,res,next)=>{
    try{
        let token = req.headers.authorization;
        if(!!token){
            let decoded = jwt.verify(token,process.env.TOKEN_SECRET_KEY);
            let response = await findUser({
                select: {
                  "id": false,
                  "name": true,
                  "role": true,
                  "email": true,
                  "password": false,
                  "feedsList": true,
                  "deleteFeedPermission": true
                },
                  where: {
                      id: decoded.id ,
                  }
              });
            req.decoded = {...decoded,...response[0]};
            console.log(decoded);
            next();
        }
        else{
            res.status(401).json({message:"Unauthorized user"});
        }
    }
    catch(error){
        console.log(error);
        res.status(400).json({message:"Error Authorizing this user"});
    }
}

module.exports = {authenticate}