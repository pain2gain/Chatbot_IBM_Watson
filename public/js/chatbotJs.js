 /*

  */


var getTime = function(){
    var myDate = new Date();
    var hour = myDate.getHours();
    var minutes = myDate.getMinutes();
    return (hour<10 ? "0"+hour: hour) +":" +(minutes<10? "0"+minutes:minutes);
  }


function userText(text,time){
  $('#parentUl').append('<li class="user">'+'<p>' + text +'</p>'+'<time>'+getTime()+'</time>'+'</li>');
  $("ul li:last-child").hide();
  $("ul li:last-child").fadeIn({ duration:time });
  $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
}

function botText(text,time){
  $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
  $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
  setTimeout( function(){
        $('.loader').hide();
        $('#parentUl').append('<li class="robot">'+'<img class="robotIcon" src="./photo/icon1.png">'+'<p class="robotText">'+ text +'</p>'+'</li>');
        $("ul li:last-child").hide();
        $("ul li:last-child").fadeIn({ duration:800 });
        $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
      } ,time);
}

function botOthers(html,time){
  $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
  $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
  setTimeout( function(){
        $('.loader').hide();
        $('#parentUl').append('<li class="others">'+ html +'</li>');
        $("ul li:last-child").hide();
        $("ul li:last-child").fadeIn({ duration:800 });
        $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
      } ,time);
}

function httpMsg(){
  var userMsg = document.getElementById("msg").value;
  if( $('#priorityTable').length){
  }
  if ( userMsg != "") {
    document.getElementById("msg").value = "";
    userText(userMsg,500);
    ajaxSend(userMsg);
    }
}


function findEntity(entity,data){
  var array = new Array();
  for(j=0;j<data.entities.length;j++){
    if(data.entities[j].entity == entity){
      array[j] = data.entities[j].value;
    }
  }
  return array.filter(d=>d);
}



function judgePrompot(name,tag,data){
  if(findEntity(name,data).length==1){
    if(name=="equipment"){
      showCards(findEntity(name,data),data);
    }else{
      $(tag).css("background-color","yellow");
      $(tag).html(findEntity(name,data));
      $(tag).attr("disabled","true");
      $(".dropdown-content a").remove();
    }
  }
  else if(findEntity(name,data).length<=12 && findEntity(name,data).length>1) {
    showCards(findEntity(name,data),data);
  }
  else if(findEntity(name,data).length>12){
    botText("Votre description sur matériels est vague, re-décrivez ou faites la commentaire s'il vous plait.",600);
      botOthers('<button class="ui-corner-all" id="commentEqpt" onclick="commentEqpt()">Commentaire?</button>',800);
  }
}

function judgeData(data){
  var array = new Array();
  // (0 symptom)   (1 equipment)  (2 location) (3 eqptType) (4 model) (5 brand) (6 adjectifsPossessifs)
  array[0] = findEntity("symptom",data).length;
  array[1] = findEntity("equipment",data).length;
  array[2] = findEntity("location",data).length;
  array[3] = findEntity("eqptType",data).length;
  array[4] = findEntity("model",data).length;
  array[5] = findEntity("brand",data).length;
  array[6] = findEntity("adjectifsPossessifs",data).length;

  if(array[0]>0 && array[1]>0){//"有症状有设备"
    judgePrompot("symptom","#symptom",data);
    judgePrompot("equipment","#equipment",data);
    judgeApi(data, array);
  }else if(array[0]==0 && array[1]>0){//"没症状有设备"
    judgePrompot("equipment","#equipment",data);
    judgeApi(data, array);
  }else if(array[1]==0){//"没有设备"
    judgePrompot("symptom","#symptom",data);
    responseFromButton();
    judgeApi(data, array);
  }
}


function judgeApi(data,array){
  if(array[2]>0){//有localisation
    //callApi(data);
  }else if (array[2]==0 && array[3]>0) {//有eqptType
    //callApi(data);
  }else if(array[2]==0 && array[3]==0 && array[4]>0){//有model
    //callApi(data);
  }else if (array[2]==0 && array[3]==0 && array[4]==0 && array[5]>0){//有brand
    //callApi(data);
  }
}

function prompot(data){
  if(data.output.text !=""){
  $('#parentUl').append('<li class="robot">'+'<img class="robotIcon"  src="./photo/icon1.png">'+'<p class="robotText">'+data.output.text +'</p>'+'</li>');
  $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
  }
  if (data.intents[0]==undefined){
    if($("#equipment").prop("disabled")!=true && $("#symptom").prop("disabled")==true){
      botOthers('<button class="ui-corner-all"  id="commentEqpt" onclick="commentEqpt()">Commentaire?</button>',100);
    }else if($("#equipment").prop("disabled")==true && $("#symptom").prop("disabled")!=true){
      botOthers('<button class="ui-corner-all"  id="commentSymp" onclick="commentSymp()">Commentaire?</button>',100);
    }else if($("#equipment").prop("disabled")!=true && $("#symptom").prop("disabled")!=true){
      botOthers('<button class="ui-corner-all"  id="commentEqptSymp" onclick="commentEqptSymp()">Commentaire?</button>',100);
    }
  }else if(data.intents[0].intent == "intent_DI"){
    judgeData(data);
  }
}


function ajaxSend(userMsg) {
    $.ajax({
		url: '/sendMsg',
		type: 'post',
		dataType: 'json',
    timeout: 50000,
    data: {jsonDatas:userMsg},
    beforeSend:function(){
      $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
      $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
    },
		success:function(data){
      $('.loader').hide();
			prompot(data);
      descriptionDI(data);
		},
    complete: function (XMLHttpRequest, textStatus) {
            if(textStatus == 'timeout'){
                if (error_callback != null && error_callback != "") {
                    error_callback();
                    $('.loader').hide();
                };
                $('.loader').hide();
            }
            $('.loader').hide();
        },
		error:function(data){
			alert('error');
		}
	});
}

descriptionSE=null;
function descriptionDI(data){
  if(findEntity("equipment",data).length>0 ||findEntity("#location",data).length>0){
    descriptionSE = data.input.text;
  }
}

function priority(){
/* ffff00 ffcc00 ff9900 ff6600 ff0000*/
    userText("priorité",400);
    var html ='<li class="robot" id="priorityTable">'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ffff00"onclick="buttonPriority(this.innerHTML)">1</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ffec00"onclick="buttonPriority(this.innerHTML)">2</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ffcd00"onclick="buttonPriority(this.innerHTML)">3</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ffb500"onclick="buttonPriority(this.innerHTML)">4</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ff9e00"onclick="buttonPriority(this.innerHTML)">5</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ff8600"onclick="buttonPriority(this.innerHTML)">6</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ff6e00"onclick="buttonPriority(this.innerHTML)">7</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ff5600"onclick="buttonPriority(this.innerHTML)">8</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ff3d00"onclick="buttonPriority(this.innerHTML)">9</button>'+
              '<button class="ui-btn ui-btn-inline ui-corner-all"id="number" style="background-color:#ff2400"onclick="buttonPriority(this.innerHTML)">10</button>'+
              '</li>';
    $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
    $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
    botText("Cliquez sur un bouton pour chosir la priorité",0);
    setTimeout( function(){
          $('.loader').hide();
          $('#parentUl').append(html);
          $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
          } ,1500);
  }


function buttonPriority(number){
    var priority = null;
    var codePriority =null;
    switch (number) {
      case "1":
      case "2":
        priority = "Secondaire";
        codePriority = "SECOND";
        break;
      case "3":
      case "4":
        priority = "Normale";
        codePriority = "NORMAL";
        break;
      case "5":
      case "6":
        priority = "Élevée";
        codePriority = "HIGH";
        break;
      case "7":
      case "8":
        priority = "Très élevée";
        codePriority = "VERYHIGH";
        break;
      case "9":
      case "10":
        priority = "Urgente";
        codePriority = "URGENT";
        break;
      default:
      alert("error");
    }
    $('#parentUl').append('<li class="user">'+'<p>' + priority+'</p>'+'<time>'+getTime()+'</time>'+'</li>');
    $('#priority').css("background-color","yellow");
    $('#priority').html(priority);
    $("#priority").val(codePriority);
    $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
    $('[id=number]').attr("disabled","true");
    $('#priority').attr("disabled","true");
    responseFromButton();
  }
/***********************************************************************************/
function commentEqpt(){
  $("[id=commentSymp]").attr("disabled","true");
  $("[id=commentEqptSymp]").attr("disabled",true);
  $("[id=commentEqpt]").attr("disabled",true);
  botOthers('<textarea id="eqptText" placeholder="Vous n\'avez pas trouvé: Ecrivez alors votre commentaire"></textarea> <button class="ui-corner-all" id="buttonConEqpt" onclick="eqptConfirmer()">Confirmer</button> <button class="ui-corner-all"  id="buttonAnnEqpt" onclick="eqptAnnuler()">Annuler</button>',500);
}
function eqptConfirmer(){
  if($("#eqptText").val()==""){
    alert("Remplissez votre commentaire!!!");
  }else{
  $("#equipment").css("background-repeat","no-repeat");
  $("#buttonConEqpt").attr("disabled","true");
  $("#buttonAnnEqpt").attr("disabled","true");
  $("#eqptText").attr("disabled","true");
  var code = $("#eqptText").val();
  userText("Commentaire matériel:   "+code, 200);
  botText("Votre choix est bien enregistré",200);
  $("#equipment").css("background-color","yellow");
  $("#equipment").html(code);
  $("#equipment").attr("disabled","true");
  setTimeout( function(){
        responseFromButton();
      } ,200);
    }
}
function eqptAnnuler(){
  $("#buttonConEqpt").css("display","none");
  $("#buttonAnnEqpt").css("display","none");
  $("#eqptText").css("display","none");
  $("[id=commentEqpt]").attr("disabled",false);
}
/***************************************************************************/

function commentSymp(){
  $("[id=commentSymp]").attr("disabled","true");
  $("[id=commentEqptSymp]").attr("disabled",true);
  $("[id=commentEqpt]").attr("disabled",true);
  botOthers('<textarea id="sympText" placeholder="Ne tourvez pas? Ecrivez votre commentaire"></textarea> <button class="ui-corner-all" id="buttonConSymp" onclick="sympConfirmer()">Confirmer</button> <button class="ui-corner-all" id="buttonAnnSymp" onclick="sympAnnuler()">Annuler</button>',500);
}
function sympConfirmer(){
  if($("#sympText").val()==""){
    alert("Remplissez votre commentaire!!!");
  }else{
  $("#symptom").css("background-repeat","no-repeat");
  $("#buttonConSymp").attr("disabled","true");
  $("#buttonAnnSymp").attr("disabled","true");
  $("#sympText").attr("disabled","true");
  var code = $("#sympText").val();
  userText("Commentaire symptôme:   "+code, 200);
  botText("Votre choix est bien enregistré",200);
  $("#symptom").css("background-color","yellow");
  $("#symptom").html(code);
  $("#symptom").attr("disabled","true");
  $(".dropdown-content a").remove();
  setTimeout( function(){
        responseFromButton();
      } ,200);
    }
}
function sympAnnuler(){
  $("#buttonConSymp").css("display","none");
  $("#buttonAnnSymp").css("display","none");
  $("#sympText").css("display","none");
  $("[id=commentSymp]").attr("disabled",false);
}

/**************************************************************************/
function commentEqptSymp(){
  $("[id=commentSymp]").attr("disabled","true");
  $("[id=commentEqptSymp]").attr("disabled",true);
  $("[id=commentEqpt]").attr("disabled",true);
  botOthers('<textarea id="eqptText2" placeholder="Ecrivez votre commentaire sur le Matériel"></textarea> <textarea id="sympText2" placeholder="Ecrivez votre commentaire sur le Symptôme"></textarea> <button class="ui-corner-all" id="buttonConEqptSymp" onclick="eqptSympConfirmer()">Confirmer</button> <button class="ui-corner-all" id="buttonAnnEqptSymp" onclick="eqptSympAnnuler()">Annuler</button>',500);
}

function eqptSympConfirmer(){
  if($("#eqptText2").val()==""||$("#sympText2").val()==""){
    alert("Remplissez votre commentaire!!!");
  }else{
  $("#symptom").css("background-repeat","no-repeat");
  $("#equipment").css("background-repeat","no-repeat");
  $("#buttonConEqptSymp").attr("disabled","true");
  $("#buttonAnnEqptSymp").attr("disabled","true");
  $("#sympText2").attr("disabled","true");
  $("#eqptText2").attr("disabled","true");
  var htmlSymp = $("#sympText2").val();
  var htmlEqpt = $("#eqptText2").val();
  userText("Commentaire matériel:"+htmlEqpt+ "<br>"+"Commentaire symptôme:"+htmlSymp , 200);
  botText("Votre choix est bien enregistré",200);
  $("#symptom").css("background-color","yellow");
  $("#symptom").html(htmlSymp);
  $("#symptom").attr("disabled","true");
  $(".dropdown-content a").remove();

  $("#equipment").css("background-color","yellow");
  $("#equipment").html(htmlEqpt);
  $("#equipment").attr("disabled","true");
  setTimeout( function(){
        responseFromButton();
      } ,200);
    }
}
function eqptSympAnnuler(){
  $("[id=buttonConEqptSymp]").css("display","none");
  $("[id=buttonAnnEqptSymp]").css("display","none");
  $("[id=eqptText2]").css("display","none");
  $("[id=sympText2]").css("display","none");
  $("[id=commentEqptSymp]").attr("disabled",false);
}

/**************************************************************************/
function responseFromButton(){
  if($('#symptom').prop("disabled")==false && $('#equipment').prop("disabled")==false && $('#location').prop("disabled")==false){
    botText("Décrivez le symptôme de votre problème et le matériel ou votre localisation.",150);
    botOthers('<button class="ui-corner-all"  id="commentEqptSymp" onclick="commentEqptSymp()">Commentaire?</button>',200);
  }
  if($('#symptom').prop("disabled")==true && $('#equipment').prop("disabled")==false && $('#location').prop("disabled")==false){
    botText("Pouvez vous donner le type de votre matériel ou votre localisation (exemple : compresseur ou parking)",150);
    botOthers('<button class="ui-corner-all"  id="commentEqpt" onclick="commentEqpt()">Commentaire?</button>',200);
  }
  if($('#symptom').prop("disabled")==false && ($('#equipment').prop("disabled")==true|| $('#location').prop("disabled")==true)){
    botText("Décrivez le symptôme de votre problème.",150);
    botOthers('<button class="ui-corner-all" id="commentSymp" onclick="commentSymp()">Commentaire?</button>',200);
  }
  if($('#symptom').prop("disabled")==true && ($('#equipment').prop("disabled")==true|| $('#location').prop("disabled")==true) && $('#priority').prop("disabled")==false){
    priority();
  }
  if($('#symptom').prop("disabled")==true && (($('#equipment').prop("disabled")==true || $('#location').prop("disabled")==true))&& $('#priority').prop("disabled")==true){
    botText("Merci de vérifier le tableau ci-dessous, le corriger si nécessaire puis cliquez sur le bouton pour valider votre demande d'intervention");
    $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
    $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
    setTimeout( function(){
          $('.loader').hide();
          confirmationPanelShow();
          $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
        } ,1000);
  }
}



function showCards(array, data){
    var html = '<li id="cards">';
      for(i=0;i<array.length;i++){
        html +=   '<div class="cardBox">'+
                  '<div class="cardBoxText">'+
                    '<p>Type:&nbsp'+data.data.equipment[i].results[0].typeDescription+'</p>'+
                    '<p>Code:&nbsp<a href="javascript:void(0)">'+data.data.equipment[i].results[0].code+'</a></p>'+
                    '<p>Description:&nbsp'+data.data.equipment[i].results[0].description+'</a></p>'+
                '</div>'+
                  '<div class="cardBoxButton">'+ //+"\'"+data.data.equipment[i].results[0].+"\'"+","
                      '<button class="ui-btn ui-corner-all" id="confirmer" onclick="buttonConfirmer('+"\'"+data.data.equipment[i].results[0].id+"\'"+","+"\'"+"Matériel"+"\'"+","+"\'"+array[i]+"\'"+')">Confirmer</button>'+
                  '</div>'+
                  '</div>';
                  }
        for(i=0;i<findEntity("location",data).length;i++){
          html+= '<div class="cardBox">'+
                    '<div class="cardBoxText">'+
                      '<p>Type: Localisation</p>'+
                      '<p>Code:<a href="javascript:void(0)">'+findEntity("location",data)[i]+'</a></p>'+
                  '</div>'+
                    '<div class="cardBoxButton">'+
                        '<button class="ui-btn ui-corner-all" id="confirmer" onclick="buttonConfirmer('+"\'"+null+"\'"+","+"\'"+"Localisation"+"\'"+","+"\'"+findEntity("location",data)[i]+"\'"+')">Confirmer</button>'+
                    '</div>'+
                    '</div>';
        }
    html+= '<div class="cardSelect" id ="cardSelect">';
    if(array.length>4){
      html+= '<div class="leftRight">'+
      '<button class="ui-btn ui-corner-all ui-icon-carat-r ui-btn-icon-right" id="leftRight"style="height:15%;width:55%;"onclick="buttonLeftRight()"></button>'+
      '</div>';
    }
    html+= '<button class="ui-btn ui-corner-all ui-icon-alert ui-btn-icon-top"id="incorrect" onclick="incorrectButton()">Incorrect?</button>'+
            "</div>"+
            "</li>";

    $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
    $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
  //  botText("Voici les matériels: ");
    $('#parentUl').append('<li class="robot">'+'<img class="robotIcon" src="./photo/icon1.png">'+'<p class="robotText">'+ "Voici les matériels:" +'</p>'+'</li>');

    setTimeout( function(){
          $('.loader').hide();
          if(array.length>0){
          $('#parentUl').append(html);
        }
          $("div.cardBox").each(function() {
            if($(this).index()>3 ){
              $(this).hide();
            }
          });
        } ,1000);
    $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
      }


/*function symptom(){
    responseFromButton();
  }*/

function equipment(){
    responseFromButton();
  }

function buttonConfirmer(id,type,code){
  $("[id=confirmer]").attr("disabled","true");
  $("#suivant").attr("disabled","true");
  $("#incorrect").attr("disabled","true");
  $("#leftRight").attr("disabled","true");
  userText(type+"  "+code,500);
  botText("Votre choix est bien enregistré");
  setTimeout( function(){
    responseFromButton();
  },800);
  if(type=="Matériel"){
  $("#equipment").css("background-color","yellow");
  $("#equipment").html(code);
  $("#equipment").attr("disabled","true");
  $("#equipment").val(id);
  $("#location").attr("disabled","true");
}else{
  $("#location").css("background-color","yellow");
  $("#location").html(code);
  $("#location").attr("disabled","true");
  $("#equipment").attr("disabled","true");
}
}

function buttonLeftRight(){
  if( $("div.cardBox").eq(4).is(':visible') ){
    if($("div.cardBox").length <= 8 ){
      $("div.cardBox").each(function() {
      if($(this).index()<4){
        $(this).show();
      }else if($(this).index()<=7 && $(this).index()>3){
        $(this).hide();
      }
      });
    }else{
      $("div.cardBox").each(function() {
        if($(this).index()<8 && $(this).index()>3){
          $(this).hide();
        }else if($(this).index()<=11 && $(this).index()>7){
          $(this).show();
        }
      });
    }
    return;
  }

  if($("div.cardBox").eq(0).is(':visible')){
    $("div.cardBox").each(function() {
      if($(this).index()<4){
        $(this).hide();
      }else if($(this).index()<=7 && $(this).index()>3){
        $(this).show();
      }
    });
    return;
  }

  if($("div.cardBox").eq(8).is(':visible')){
    $("div.cardBox").each(function() {
      if($(this).index()<4){
        $(this).show();
      }else if($(this).index()<=11 && $(this).index()>7){
        $(this).hide();
      }
    });
    return;
  }
}

function annulerDI(){
  window.location.reload();
}


function prepareJson(){
  var symp = null;
  var sympComment=null;
  var eqpt = null;
  var eqptComment =null;

  if($("#symptom").css("background-repeat")=="repeat"){
    symp =  $("#symptomSend").html();
  }else {
    sympComment = $("#symptomSend").html();
  }

  if ($("#equipment").css("background-repeat")=="repeat") {
    eqpt = $("#equipmentSend").html();
  }else {
    eqptComment = $("#equipmentSend").html();
  }

  var idSymp=null;
  switch ($("#symptomSend").html()) {
    case "NE-DEMARRE-PAS":
      idSymp = "11841ebe408-3681";
      break;
    case "TEMP-ELEVE":
      idSymp = "11841ebe408-3682";
      break;
    case "BRUIT-ANORMAL":
      idSymp = "11841ebe408-3683";
      break;
    case "COUPURE-ELECTRIQUE":
      idSymp = "11841ebe408-3685";
      break;
    case "ALERTE":
      idSymp = "11841ebe408-3686";
      break;
    case "FUITE":
      idSymp = "11841ebe408-3a69";
      break;
    case "FUMEE":
      idSymp = "11841ebe408-3a76";
      break;
    case "ALARME":
      idSymp = "1316781a440-1a6";
      break;
    case "ASPIRATION":
      idSymp = "1316781a440-1a7";
      break;
    case "BLOCAGE":
      idSymp = "1316781a440-1a8";
      break;
    case "CONNEXION":
      idSymp = "1316781a440-1af";
      break;
    case "DEBIT":
      idSymp = "1316781a440-1b0";
      break;
    case "ERREUR":
      idSymp = "1316781a440-1b1";
      break;
    case "LEVEE":
      idSymp = "1316781a440-1b2";
      break;
    case "PURGE":
      idSymp = "1316781a440-1b3";
      break;
    case "SECURITE":
      idSymp = "1316781a440-1b4";
      break;
    case "VANDALISME":
      idSymp = "1316781a440-1b5";
      break;
    default:
    break;
  }

  if(descriptionSE==null){
    var description = $("#prioritySend").html();
  }else{
    var description = descriptionSE;
  }

  var jsonDatas = {
    codeEqpt:eqpt,
    commentEqpt:eqptComment,
    codeSymp:symp,
    commentSymp:sympComment,
    idEqpt:$("#equipment").val(),
    idSymp:idSymp,
    title:description,
    priorityDecrition: $("#priority").val(),
    comment:$("#comment").html(),
    latitude:$("#latitude").html()!=undefined ? $("#latitude").html():null,
    longitude:$("#longitude").html()!=undefined ? $("#longitude").html():null,
    localisationCode:$("#location").html()!="Localisation" ? $("#location").html():null,
  }
  return jsonDatas;
}


function envoyerDI(){
  var jsonDatas = prepareJson();
  $.ajax({
  url: '/sendDI',
  type: 'post',
  dataType: 'json',
  data: jsonDatas,
  beforeSend:function(){
    $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
    $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
  },
  success:function(data){
    $('#parentUl').append('<li class="robot">'+'<p class ="loader">' +'</p>'+'</li>');
    $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
    $("#deleteLocation").remove();
    $("#deletePhoto").remove();
    setTimeout( function(){
          $('.loader').hide();
          $('#sendDI').attr('disabled',"disabled");
          $('#annulerDI').attr('disabled',"disabled");
          $('#comment').attr('disabled',"disabled");
          $('#iconPhoto').removeAttr('onclick');
          $('#iconLocation').removeAttr('onclick');
          $('#parentUl').append('<li class="robot">'+'<img class="robotIcon" src="./photo/icon1.png">'+'<p class="robotText">'+ "Votre demande d'intervention a été bien envoyée." +'</p>'+'</li>');
          $('#parentUl').append('<li class="others">'+'<button class="ui-btn ui-btn-inline ui-corner-all" onclick="annulerDI()"> Une autre demande?</button>'+'</li>');
          $('#parentUl')[0].scrollTop = $('#parentUl')[0].scrollHeight;
        } ,800);
  },
  error:function(data){
    alert('error');
  }
});
}

function funNoCreated(){
  $("#choiceWindow").slideDown("normal");
  $("#backGround").show();
}
function iconXMap(){
  $("#boxDisplay").hide();
  $("#backGroundMap").hide();
}

function iconLocation(){
  $("#boxDisplay").show();
  $("#backGroundMap").show();
}


function iconX(){
  $("#choiceWindow").hide();
  $("#backGround").hide();
}

function confirmationPanelShow(){

  var html = '<li id="confirmationPanel">'+
                '<div id="titre">Vérifiez les informations de commande</div>'+
                '<div class="confirmationBox">'+
                  '<info id="info">';
  if($("#equipment").css("background-repeat") == "no-repeat" && $("#equipment").css("background-color")=="rgb(255, 255, 0)"){
    html+=  '<panel>Matériel</panel>';
    html += '<code contenteditable = "true" id="equipmentSend">'+ $("#equipment").html()+'</code>';
  }else if($("#equipment").css("background-repeat") == "repeat" && $("#equipment").css("background-color")=="rgb(255, 255, 0)"){
    html+=  '<panel>Matériel</panel>';
    html += '<code id="equipmentSend">'+ $("#equipment").html()+'</code>';
  }else{
    //alert($("#equipment").css("background-color"));
    html+=  '<panel>Localisation:</panel>';
    html += '<code id="localisationSend">'+ $("#location").html()+'</code>';
  }
            html+= '</info>'+
                  '<info id="info">'+
                    '<panel>Symptôme</panel>';
  if($("#symptom").css("background-repeat") == "no-repeat"){
    html+='<code contenteditable = "true" id="symptomSend" >'+$("#symptom").html()+'</code>';
  }else{
    html+='<code id="symptomSend">'+$("#symptom").html()+'</code>';
      }
        html+=   '</info>'+
                  '<info id="info">'+
                      '<panel>Priorité</panel>'+
                      '<code id="prioritySend">'+$("#priority").html()+'</code>'+
                  '</info>'+
                  '<info id="info">'+
                    '<panel>Adresse</panel>'+
                    '<img src="./photo/location.png" id="iconLocation"onclick="iconLocation()" width="7%" height="100%"/>'+
                  '</info>'+
                  '<info id="info">'+
                    '<panel>Photo</panel>'+
                    '<input type="file" id="btn_file" style="display:none">'+
                    '<img src="./photo/photo.png" id="iconPhoto" onclick="F_Open_dialog()" width="7%" height="100%"/>'+
                    '<img src="" id="img0" width="120" class="hide" style="display:none">'+
                  '</info>'+
                '</div>'+
                '<div id ="commentaire">'+
                  '<textarea id="comment" placeholder="Ecrivez votre commentaire..."></textarea>'+
                '</div>'+
                '<div id="buttonSend">'+
                  '<button class="ui-btn ui-btn-inline ui-corner-all" id="sendDI"onclick="envoyerDI()" style="float:right">Envoyer</button>'+
                  '<button class="ui-btn ui-btn-inline ui-corner-all"id="annulerDI" onclick="annulerDI()"style="float:right">Annuler</button>'+
                '</div>'+
              '</li>';
    $("#parentUl").append(html);

}

function callApi(data){
  if (findEntity("model", data).length>0){
    botText("Call API....model");
  }
  if(findEntity("location",data).length>0){
    botText("Call API....location");
  }
  if(findEntity("eqptType", data).length>0){
    botText("Call API....eqptType");
  }
  if(findEntity("brand", data).length>0){
    botText("Call API....brand");
  }
}


function F_Open_dialog(){
  document.getElementById("btn_file").click();
  $("#btn_file").change(function(){
    var objUrl = getObjectURL(this.files[0]) ;
    console.log("objUrl = "+objUrl) ;
    if (objUrl)
    {
        $("#img0").attr("src", objUrl);
        $("#img0").show();
        $("#img0").after('<button class="ui-btn ui-btn-inline ui-corner-all" id="deletePhoto"  style="padding:0;margin-left:3px;color:#808080;" onclick="deletePhoto()">'+"X"+'</button>');
    }
  });
}

function getObjectURL(file){
    var url = null ;
    if (window.createObjectURL!=undefined)
    { // basic
        url = window.createObjectURL(file) ;
    }
    else if (window.URL!=undefined)
    {
        // mozilla(firefox)
        url = window.URL.createObjectURL(file) ;
    }
    else if (window.webkitURL!=undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file) ;
    }
    return url ;
}

function incorrectButton(){
  $("[id=confirmer]").attr("disabled","true");
  $("#suivant").attr("disabled","true");
  $("#incorrect").attr("disabled","true");
  $("#leftRight").attr("disabled","true");
  commentEqpt();
}


function deleteLocation(){
  $("#latitude").hide();
  $("#longitude").hide();
  $("#nameLocation").remove();
  $("#deleteLocation").remove();
}
function deletePhoto(){
  $("#img0").remove();
  $("#deletePhoto").remove();
}
function clickSymptom(symptom){
  $("#symptom").css("background-color","yellow");
  $("#symptom").html(symptom);
  $("#symptom").attr("disabled","true");
  $(".dropdown-content a").remove();
  responseFromButton();
}
