let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
const userTypes = require("./constants");
const fs = require('fs');

let currentFile = `/${Date.now().toString()}.txt`;
let filePath = "";
let path = (__dirname).split("\\");
path.pop();
path.push("logs");
filePath = path.join("\\");
let writeStream = fs.createWriteStream(filePath+currentFile);

const encryptPassword = async(password)=>{
    let encrypted = await bcrypt.hash(password,Number(process.env.ENCRYPTION_ROUNDS));
    return encrypted;
}

const verifyPassword = async(password,hash)=>{
    let decrypted = await bcrypt.compare(password,hash);
    return decrypted;
}

const createToken = (payload)=>{
    let token = jwt.sign(payload,process.env.TOKEN_SECRET_KEY);
    return token;
}

const logInfo = (message) => {
    writeStream.write(`${Date.now()} : `+message+"\n");
}

const getLogs = async() => {
    return new Promise((res,rej)=>{
        fs.readFile((filePath+currentFile),(err,data)=>{
            if(err){
                rej(err);
            }
            console.log(data.toString());
            res(data.toString());
        });
    })
}

const feedPermissionsCheck = (role,deletePermission=false)=>{
    console.log(role,deletePermission);
    console.log(role!==userTypes.super);
    console.log(role===userTypes.admin && !deletePermission);
    if((role!==userTypes.super) && (role===userTypes.admin && !deletePermission)){
        throw Error("You do not have access to take this action");
    }
}

const userPermissionCheck = (role,deletePermissionApi=false) => {
    if((role === userTypes.basic || (role===userTypes.admin && deletePermissionApi))){
        throw new Error("You do not have access to take this action.");
    }
}

const startLogging = () => {
    setInterval(()=>{
        // create new File
        currentFile = `/${Date.now().toString()}.txt`;
        writeStream.close((err)=>{
            if(err){
                console.log("File Error:"+err);
            };
        });
        writeStream = fs.createWriteStream(filePath+currentFile);

        // delete older files
        fs.readdir(filePath, (err, files) => {
            if(err){
                console.log("File Error:"+err);
            }
            files.forEach(file => {
              let timeStamp = (Number)(file.split(".")[0]);
              let checkTimeStamp = Date.now() - process.env.DELETE_FILE_TIME;
              if((timeStamp - checkTimeStamp)<0){
                fs.rm(filePath+"/"+file,(err)=>{
                    if(err){
                        console.log("File Error:"+err);
                    };
                    logInfo("File deleted:"+file);
                });
              }
            });
          });
    },
    process.env.NEW_FILE_TIME
    );
}


module.exports = {
    getLogs,
    logInfo,
    createToken,
    verifyPassword,
    encryptPassword,
    feedPermissionsCheck,
    userPermissionCheck,
    startLogging,
}