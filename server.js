const bodyParser = require('body-parser');
const express = require('express');
const app = express();
      app.use(express.static('public'));
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({extended: false}));


const AssistantV1 = require('ibm-watson/assistant/v1');
const service = new AssistantV1({
  version: '2019-02-28',
  username: "apikey",
  /************************************************************************/
  //Fill your api_key and your url
  iam_apikey: '#your_api_key',
  url: '#url_of_your_region '
  /*************************************************************************/
});


const username ='CARLSOURCE';
const password = 'admin';
const auth = "Basic " + new Buffer.from(username + ":" + password).toString("base64");

    app.post('/sendMsg',function(req,res,err){
    console.log("Msg: "+req.body.jsonDatas);
    service.message({
      /************************************************************************/
      //Fill your workplace_id
      workspace_id: '',
      /************************************************************************/
      input: {'text': req.body.jsonDatas}
    })
      .then(response => {
        var responseJson = JSON.parse(JSON.stringify(response, null, 2));
        judgeData(responseJson).then(jsonAll=>{
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
  var array = new Array();
  for(j=0;j <data.entities.length;j++){
    if(data.entities[j].entity == entity){
      array[j] = data.entities[j].value;
    }
  }
  return array.filter(d=>d);
}



function callEveryApi(code){
  var url = "http://csref-rd.carl-intl.fr:8180/xnet/api/ui/v1/search?_limit=50";
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
  // (0 symptom)   (1 equipment)  (2 location) (3 eqptType) (4 model) (5 brand) (6 adjectifsPossessifs)
  var arrayEqpt = findEntity("equipment",data);
  var arrayLocation = findEntity("location",data);
  var arrayType = findEntity("eqptType",data);
  var arrayModel = findEntity("model",data);
  var arrayBrand = findEntity("brand",data);

  if(arrayEqpt.length>0 && arrayEqpt.length<=12){
    return (await callApis(arrayEqpt));
  }
}


/***********************************************/
//从前端获取DI的信息，并且发送给CS
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
     //console.log(response);
     console.log("*****************************************************************************");
     /*console.log(body);*/
   }
   });
});


function addIdEqpt(mrID,idEqpt){
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
    if(response&&response.statusCode==200){
      console.log(" Materiel OK!");
    }else{
      console.log("Error - -");
   }
 });
}
/*********************************************************/
//监听3001端口
app.listen(3001,()=>{
    console.log("http://localhost:3001");
  })
