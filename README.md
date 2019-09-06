<h1>Chatbot based on IBM Watson Assistant</h1>


<h2>Introduction</h2>

The program is a Chatbot project based on the engine of [IBM Watson Assistant](https://www.ibm.com/cloud/watson-assistant/). It is a simple demo of my internship at [CARL Software](https://www.carl-software.fr/) for six months.
It just has a French version, but the engine of IBM Watson supports many [languages](https://cloud.ibm.com/docs/services/assistant?topic=assistant-language-support). The system depends also on the CARL Source for getting the entities and sending the request of intervention.
![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/architeture.png)

The frame diagram shows us the overview of the system.

<h2>Installation</h2>

<h4>Server environment:</h4>

1. Download [Node.js](https://nodejs.org/en/) and install Nodejs in your computer environment.
2. Npm which is the package management system for Node.js has been integrated. So Node-SDK IBM Watson can be downloaded directly with the `npm install ibm-watson` in CMD. 
3. The same for SDK Express `npm install express` in CMD.



<h4>Download code:</h4>

You can use Git or checkout with SVN using the web URL or download them directly.


![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/download_code.JPG)

<h4>Apikey and workplace_id of IBM Watson:</h4>

To finish your connection with the chatbot, you have to open the `server.js` to fill your `url, apikey,workplace_id` of your account.
 
[Site official IBM Watson assistant](https://www.ibm.com/cloud/watson-assistant/), Click the `Get started free`, and login with your account.

How to get the apikey and workplace_id from your IBM watson assistant account: 

View API details: 
![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/watson_apikey1.JPG)

![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/watson_apikey2.png)


<h2>To run</h2>

`node server.js`

<h2>Tips</h2>

The demo chatbot is designed in the environment of Chrome browser. So maybe the other environment can not be supported very well.

<h2>Explanation</h2> 
First of all, it's necessary to explain the relations between every part for the frame diagram:

* <h4>User & GUI</h4>

With the natural language, user can realise an friendly interaction with the GUI.

* <h4>GUI & Backend</h4>

With the [Ajax HTTP Request](https://api.jquery.com/jquery.ajax/), the GUI can send user's description to Chatbot. In the case of the asynchronous request, GUI will get the response of Chatbot engine.

* <h4>Backend & Chatbot</h4>

With the API of IBM Watson, backend sends the description of the production problem to chatbot engine for getting the processing result.

* <h4>Backend & CARL Source</h4>

With the REST API of CARL Source, backend will get the details of the equipment and send the request to CARL Source.
Now here the REST api we get from the CS:

* With code of equipment, to get more details, the uri of CS:

    `http://csref-rd.carl-intl.fr:8180/xnet/api/ui/v1/search?_limit=50`

* With all entities found, to send the request of intervention, the uri of CS: 

    `http://csref-rd.carl-intl.fr:8180/xnet/api/entities/v1/mr`

* With the id of equipment, to add the equipment information to the request already existing, the uri of CS: 

    `http://csref-rd.carl-intl.fr:8180/xnet/api/entities/v1/mreqpt`

* <h4>CARL Source & Chatbot</h4>

Manually, we downloaded the data from CARL Source to get the entities of 'Equipement', 'Localisation', 'TypeEQPT', 'Marque', 'Symptômr', 'Modèle' and process these data.

<h2>Watson Assistant initialisation</h2>

* <h4>Entities</h4>

The CSV file format for eneities:

    entity1, value_a, A_synonym_1

    entity1, value_b, B_synonym_1, B_synonym_2

    entity2, value_c, C_synonym_1, C_synonym_2, C_synonym_3
    
Example:

    equipement, 01785, Poteau Incendie Emeraude DN100, PI-EMERAUDE-100, Poteau Incendie Emeraude DN100
    
    equipement, B1001, Bus Standard 1001, CITELIS-12, Bus Citelis 12, Bus, TRG01010305, TR02010102, IRISBUS

    equipement, CLIM-001, Climatiseur 001, Climatiseur Carrier 50TZ, TRG0101010302, TR01010204, CARRIER

![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/import_entities.png)
* <h4>Intent</h4>
The CSV file format for intents:
```
    example, intent1
    
    example, intent1
 
    example, intent2
```
Example:
```
    La pompe hydraulique fuit,intent_DI
    
    Il y a du bruit anormale sur mon Renault,intent_DI
    
    j'ai un problème,intent_DI
```
* <h4>Dialogue</h4>

Watson assistant has the management of flow dialogue which helps us to manage the sequence of the conversations.
Nodes present the rounds of dialogue. 

![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/watson_dialogue_flow.jpg)


After defining the order of nodes conversation, we should initialize all of them. Like the following picture, if the assistant recognizes the intent of #intent_DI,
then it will check the entities in the user's description. We can also choose the entity is  optional or not, and according to it's type we can define somme response to make our dialogue more flexible.

![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/watson_dialogue_response.JPG)


<h2>Watson API</h2>

With the [API of Watson Assistant](https://cloud.ibm.com/apidocs/assistant?code=node), we can send the message to chatbot engine.
Now the IBM watson has 2 versions API, the V1 is used by the system. We need also to find the apikey,workspace_id, and url.
URL depens on your region:

```
 Dallas: https://gateway.watsonplatform.net/assistant/api
 
 Washington, DC: https://gateway-wdc.watsonplatform.net/assistant/api
 
 Frankfurt: https://gateway-fra.watsonplatform.net/assistant/api
 
 Sydney: https://gateway-syd.watsonplatform.net/assistant/api
 
 Tokyo: https://gateway-tok.watsonplatform.net/assistant/api
 
 London: https://gateway-lon.watsonplatform.net/assistant/api
```

Example for calling the api of Watson:

```js
    const AssistantV1 = require('ibm-watson/assistant/v1');
    
    const service = new AssistantV1({
      version: '2019-02-28',
      iam_apikey: '{apikey}', //apikey can be found from your ibm account
      url: '{url}' //url depends on your region
    });
    
    service.message({
      workspace_id: '{workspace_id}',// workspace can be found from your ibm account
      input: {'text': 'Hello'} // the message will be sent to chatbot engine
      })
      .then(res => {
        console.log(JSON.stringify(res, null, 2));
      })
      .catch(err => {
        console.log(err)
      });
```

The JSON response from the chatbot engine:

![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/response_of_chatbot.png)


<h2>CARL Source</h2>
Here is the example for sending the resquest of intervention.

```js
var request = require('request'); // request sdk
var json = {                      // the json will be sent to CARL Source system  
        data: {
            type: "mr",
            attributes: {
                description: "description",
                workPriority: "workPriority",
                latitude:"latitude",
                longitude:"longitude"
            },
            symptom: {
                data: {
                type: "symptom",
                id:"idSymp"
                }
            }
        }
    };

   var auth = "Basic " + new Buffer.from("username" + ":" + "password").toString("base64"); 
   // the authorization is necessary, just your CRL Source username and password can make it passe.
   
   var url = "http://csref-rd.carl-intl.fr:8180/xnet/api/entities/v1/mr" // the uri to send a request
   request({
       url : url,
       method:'POST',
       body: json,
       headers : {"Content-Type":"application/vnd.api+json","Authorization" : auth}
   },
   function (error, response, body) {
   });
```
