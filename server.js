const bodyParser = require('body-parser');
const express = require('express');
const app = express();
      app.use(express.static('public'));
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({extended: false}));


/**
The function has 2 main functions: To get the message from Front-end and To send the message to cahtbot engine
We must fill the #your_api_key, #url_of_your_region, #your_workplace_id
**/
const AssistantV1 = require('ibm-watson/assistant/v1');
const service = new AssistantV1({
  version: '2019-02-28',
  username: "apikey",
  iam_apikey: '#your_api_key', // fill in your APIKey
  url: '#url_of_your_region'  // fill in your URL, in France https://gateway-lon.watsonplatform.net/assistant/api
});

app.post('/sendMsg',function(req,res,err){
  console.log("Msg: "+req.body.jsonDatas);
  service.message({                       // Send the Msg to the chatbot, according the API of IBM Watson
  workspace_id: '#your_workplace_id',   // Fill your workplace_id
  input: {'text': req.body.jsonDatas}
  }).then(response => {
      var responseJson = JSON.parse(JSON.stringify(response, null, 2));
      judgeData(responseJson).then(jsonAll=>{ // Call CARL Source API, then add them into response json of Chatbot engine
      responseJson["data"]=jsonAll;
      console.log(responseJson);
      res.json(responseJson);
      }).catch(error=>{
        console.log(error);
        });
    })
    .catch(error => {
      console.log(error);
      });
  });



function findEntity(entity,data){
  /**
  According to the response of Chatbot, we search every type of entities

  input:
      1. entity=> type of entitiy  EX: equipment, model, location....
      2. data=> the json response from chatbot engine
  output:
      1. array containts the code of every entity
  **/
  var array = new Array();
  for(j=0;j <data.entities.length;j++){
    if(data.entities[j].entity == entity){
      array[j] = data.entities[j].value;
    }
  }
  return array.filter(d=>d);
}


/***
The info necessary for calling the API of CARL Source.
Authorization:
    userName = "CARLSOURCE"
    password = "admin"
***/
const username ='CARLSOURCE';
const password = 'admin';
const auth = "Basic " + new Buffer.from(username + ":" + password).toString("base64");


function callEveryApi(code){
  /**
  Call CARL Source API with the code of Equipment

  Input:
      1. code => the code of equipment
  Output:
      1. Promise type which can realize the synchronous fucntion
        if success, return "resolve", if not return "reject"
  **/
  var url = "http://csref-rd.carl-intl.fr:8180/xnet/api/ui/v1/search?_limit=50"; // The server is http://csref-rd.carl-intl.fr:8180
  var request = require('request');
  var textCode = {
    types : [
        'com.carl.xnet.stocks.backend.bean.ItemBean',
        'com.carl.xnet.equipment.backend.bean.MaterialBean'
        ],
    criterias: [
        {
            attributeName:"code",
            value:code,
            type:"PREFIX_PHRASE"
        }]};
  var jsonDI =JSON.stringify(textCode,null, 2);
  return new Promise((resolve,reject)=>{
    request({
         url : url,
         method:'POST',
         body:jsonDI,
         headers : {"Content-Type":"application/vnd.api+json","Authorization" : auth}
     },
     function (error, response, body) {
      if(response&&response.statusCode==200){
        resolve(body);
      }else{
        reject("Error - -");
     }
     });
   })
}


async function callApis(array){
  /**
  The function is realized for calling the API(with "callEveryApi"), then add them together into equipment json

  Input:
      1. array=> the array of the code.
  output:
      2. jsonAll=> the json file which contains the details of all the equipment
  **/

  let jsonAll = {
    equipment:[],
  };
  for(i =0; i<array.length; i++){
    let json = await callEveryApi(array[i]);
    jsonAll.equipment.push(JSON.parse(json));
  }
  return jsonAll;
};



async function judgeData(data){
  /**
  The function will get every array of entity, and call API,
  But we can just find the details of equipment with their code because of the CS API

  Input:
      1. data=> the json response of Chatbot engine
  Output:
      1. the return of "callApis" the json which contains the results of CS APIs
  **/
  var arrayEqpt = findEntity("equipment",data);
  var arrayLocation = findEntity("location",data);
  var arrayType = findEntity("eqptType",data);
  var arrayModel = findEntity("model",data);
  var arrayBrand = findEntity("brand",data);

  if(arrayEqpt.length>0 && arrayEqpt.length<=12){
    return (await callApis(arrayEqpt));
  }
}




/**
The function can receive the necessary entities from Front-end to send the request
URL: "http://csref-rd.carl-intl.fr:8180/xnet/api/entities/v1/mr"
**/

app.post('/sendDI',function(req,res,err){
  var url = 'http://csref-rd.carl-intl.fr:8180/xnet/api/entities/v1/mr';
  console.log(req.body);
  var request = require('request');
  var textDI = {
      data: {
          type: "mr",
          attributes: {
            description: req.body.title,
              workPriority: req.body.priorityDecrition,
              latitude:req.body.latitude,
              longitude:req.body.longitude,
          }
        }
      };
  if(req.body.idSymp!=null){
    var sympDI={
      symptom: {
        data: {
            type: "symptom",
            id:req.body.idSymp
        }
    }
  };
    textDI.data["relationships"]=sympDI;
  }
  var jsonDI =JSON.stringify(textDI,null, 2);
  console.log(jsonDI);

  request({
       url : url,
       method:'POST',
       body:jsonDI,
       headers : {"Content-Type":"application/vnd.api+json","Authorization" : auth}
   },
   function (error, response, body) {
    if(!body.errors){
      res.json({ok:"ok!"});
      console.log(body);
      addIdEqpt(JSON.parse(body).data.id,req.body.idEqpt);
    }else{
      res.json({error:"error"});
      console.log(error);
   }
   });
});


function addIdEqpt(mrID,idEqpt){
  /**
  With the request ID, we can add the equipment information into it.
  Input:
      1. mrID=> the request ID
      2. idEqpt=> the equipment ID
  **/
  var url = 'http://csref-rd.carl-intl.fr:8180/xnet/api/entities/v1/mreqpt';
  var request = require('request');
  var textJson = {
    data: {
        type: "mreqpt",
        attributes: {
            directEqpt: "true",
            referEqpt: "true"
        },
         relationships: {
            MR: {
                data: {
                    type: "mr",
                    id: mrID
                }
            },
            eqpt: {
                data: {
                    type: "material",
                    id: idEqpt
                }
            }
        }
    }
}
var jsonDI =JSON.stringify(textJson,null, 2);
  request({
       url : url,
       method:'POST',
       body:jsonDI,
       headers : {"Content-Type":"application/vnd.api+json","Authorization" : auth}
   },
   function (error, response, body) {
     var bodyJson = JSON.parse(body);
     if(bodyJson.data.id !=null && bodyJson.data.id !=undefined){
       console.log("Ajout de Materiel, OK!");
     }else{
       console.log("Error - -");
    }
 });
}

//listening the port of 3001
app.listen(3001,()=>{
    console.log("http://localhost:3001");
  })
