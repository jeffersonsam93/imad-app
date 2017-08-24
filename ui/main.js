console.log('Loaded!');
var submitbtn=document.getElementById("submit-btn");
submitbtn.onclick=function(){
    var request=new XMLHttpRequest();
    var username=document.getElementById("username").value;
    var password=document.getElementById("password").value;
    request.onrequeststatechange=function(){
      if(request.readyState===XMLHttpRequest.DONE){
          if(request.status===200){
              alert("logged in successfully");
          }
          else{
              alert("Login failed");
          }
      }  
    };
    request.open("POST","http://jeffersonsam93.imad.hasura-app.io/login",true);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({"username":username,"password":password}));
};