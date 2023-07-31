//IMPORTS SECTION-----------------------------------------------
require('dotenv').config();
const express = require('express')
const app = express()
const dbServices = require("./db/db.js")
const userRoutes = require("./routes/users.js")
const feedRoutes = require("./routes/feeds.js")
const { authenticate } = require('./helper/middleware.js')
const helperServices = require('./helper/helper.js');
const userTypes = require('./helper/constants.js');
app.use(express.json());
//--------------------------------------------------------------


//API SECTION---------------------------------------------------
app.post('/login', async(req, res) => {
    try{
        let {email,password} = {...req.body};
        if(!email || !password){
            throw Error((email?"Password":"Email")+" not provided");
        }

        let user = await dbServices.findUser({where: {email:email||""}});
        if(!user || (user.length!=1)){
            throw Error("User does not exist");
        }

        let verify = await helperServices.verifyPassword(password,user[0].password);
        if(!verify){
            throw Error("Invalid credentials");
        }

        let token = await helperServices.createToken(user[0]);
        helperServices.logInfo("Logged In user: "+res[0])
        res.status(200).json({ message: "Logged in successfully",token: token ,...user[0], password:null })
        } catch(error) {
        res.json({ message: "Error: "+error.message })
        }
    })

app.get('/get-logs', async(req, res) => {
    try{
        let data = await helperServices.getLogs();
        console.log(data);
        res.status(200).json({ data: data})
      } catch(error) {
        res.json({ message: "Error: "+error.message })
      }
  })
//--------------------------------------------------------------

//ROUTES SECTION--------------------------------------------
app.use(authenticate);
app.use('/users',userRoutes);
app.use("/feeds",feedRoutes);
//--------------------------------------------------------------

//SERVER INIT---------------------------------------------------
dbServices.dataSource.initialize().then(()=>{

    //DB CONNECTION---------------------------------------------
    console.log("Database connected.");
    dbServices.initRepositories();
    //----------------------------------------------------------

    //SERVER START----------------------------------------------
    app.listen(process.env.PORT, async() => {
        console.log(`App listening on port ${process.env.PORT}`);
        helperServices.logInfo("Server Start")

        // helperServices.startLogging();

        let superUsers = await dbServices.findUser({where: {
            role: userTypes.super ,
        }});
        if(!superUsers || superUsers.length===0){
            let pass = await helperServices.encryptPassword(process.env.SUPER_ADMIN_PASSWORD);
            let res = await dbServices.createUser({
                name: "Super User",
                role: userTypes.super,
                email: process.env.SUPER_ADMIN_EMAIL,
                password: pass,
                feedsList: [],
                deleteFeedPermission:true,
            });
            helperServices.logInfo("Super user created: "+JSON.stringify(res))
        }
    })
    //----------------------------------------------------------

}).catch((err)=>{

    //DB ERROR HANDLING-----------------------------------------
    console.log("Error:",err);
    //----------------------------------------------------------

});
//--------------------------------------------------------------