<h1>A chatbot based on IBM Watson Assistant</h1>


<h3>About</h3>

The program is a Chatbot project based on the engine of IBM Watson Assistant. It is a simple demo of my internship at CARL Software for six months.
It just has a French version, but the engine of IBM Watson   
![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/architeture.png)

The below blue frame including chatbot is what i did during my internship. 

First of all, it's necessary to explain the **relations** of every parts:

**User & GUI**

With the natural language, user can realise an friendly interaction with the GUI.

**GUI & backend**

With the Ajax HTTP Request, the GUI can send user's description to Chatbot. In the case of the asynchronous request, GUI will get the response of Chatbot engine.

[Link of JQuery.ajax()](https://api.jquery.com/jquery.ajax/)

**backend & chatbot**
With the API of IBM Watson, backend sends the description of the production problem to chatbot engine for getting the processing result.
![image](https://github.com/pain2gain/Chatbot_IBM_Watson/raw/master/images/response_of_chatbot.png)

**backend & CARL Source**

<h3>Dependencies</h3>

1. Node.js v10.15.3 
2. Node-SDK IBM Watson `npm install ibm-watson`
3. Node-SDK Express `npm install express`


[nimade](google.com)

~~~~ 消除线

__  斜体
