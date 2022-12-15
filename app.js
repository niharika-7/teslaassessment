const express = require('express')
const app = express()
const port = 3000
const path = require("path")
const AWS = require("aws-sdk")
var bodyParser = require('body-parser')
const serverless = require('serverless-http');
require('dotenv').config()
var jsonParser = bodyParser.json()
app.use(express.static('public')); 

//Loads the AWS credentials from the properties file. 
const s3 = new AWS.S3({
    accessKeyId: process.env.access_key,
    secretAccessKey: process.env.secret_key,
    });
    const BUCKET = process.env.bucket_name;

//handles the GET end point    
app.get('/errors', (req, res) => {
  let result = [];
    s3.listObjectsV2({ Bucket: process.env.bucket_name }, function(err, data) {
        if (err) console.log(err, err.stack); 
        else  {
         let contents = data.Contents;
         for (let i = 0; i < contents.length; i++) {    
          s3.getObject({Bucket: process.env.bucket_name, Key: String(contents[i].Key)}, function(err, data) {
            if (err) console.log(err, err.stack); 
            else     {
              result.push(JSON.parse(data.Body.toString('utf-8')));
              }          
          });
        }
        }            
      });
      setTimeout(() => {res.send({"errors":result});}, 2500);
})

//Handles the DELETE end point
var result = [];
app.delete('/errors',  (req, res) => {
      getAllKeys();
      setTimeout(() => {
        if(result.length!=0){
        for(let i = 0; i < result.length; i++){
            s3.deleteObject({
                Bucket: process.env.bucket_name,
                Key: result[i]
              }, function(err, data) {
                if (err) {
                  console.log(err);
                
                } else {
                  res.send("Objects deleted");
                }
              });
         }}
         else{
          res.end();
         }
        }, 5000);
  })

  //handles the POST end point
  app.post('/temp', jsonParser, function (req, res) {
    if(req.body!=undefined && req.body.data!=undefined && req.body.data.split(":").length==4){
    let data = String(req.body.data);
    let components = data.split(":");
    if(components[2]!="\'Temperature\'" || components[3].indexOf(".")== -1) { 

   let randKey  = Math.floor(Math.random()*90000) + 10000;
   const params = {
   Bucket: process.env.bucket_name,
   Key: String(randKey),
   Body: Buffer.from(JSON.stringify(req.body.data)),
   ContentEncoding: 'base64',
   ContentType: 'application/json'
  
};

s3.upload(params, function(err, data)
 {
  if (err) {
      throw err;
  }
  res.status(400).send({"error": "bad request"});
  
}); 
    }else{
       let temp = components[3].split(".")[0];
       if(Number(temp)>=90){
        var d = new Date,
        dformat = [d.getFullYear(),d.getMonth()+1, d.getDate()].join('/')+' '+ [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
        let result = {
            "overtemp": true,
            "device_id": components[0],
            "formatted_time": dformat
        }
        res.send(result);
       }else{
        let result = {"overtemp": false};
        res.send(result);
       }
    }
}
else{
    res.status(400).send({"error": "bad request"});
}
  })

 // A Helper method. This returns all the keys in the S3 bucket. This will be used by other end points.
async function getAllKeys(){
  s3.listObjectsV2({ Bucket: process.env.bucket_name }, function(err, data) {
    if (err) console.log(err, err.stack); 
    else  {  
     let contents = data.Contents;
     for (let i = 0; i < contents.length; i++) {
        result.push(contents[i].Key);
    }
    }           
  });
  return result; 
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
module.exports.handler = serverless(app);