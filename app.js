//video 1:23:46
var express=require('express'),//Importing Express JS
    app=express(),//Creating app out of ExpressJS

    //along with express we will be using socket.io, for that we need HTTP module
    server=require('http').createServer(app),//will create server using http module
    //we need express server which requires by socket.io
    io=require('socket.io').listen(server);//socket.io will run another services along with express app
    //in the same nodeJS application on a separate socket, that’s why we need to start express as well as 
    //socket.io, as two different services. 

//that’s why we are trying to achieve hear, one is we are passing the server object after creating server object using my express application, I am going to pass server application into 
//My socket.io library. I am going to requires socket.io after installing it, I am going to listen using the server object. I am not yet listening on server itself that is expressjs rather I am listening on my socket.io, so the object which I use all going forward in my application that is known as io object that is my socket.io library object.       

  users={};//we also have global dictionary that is users which is empty, this is where we will be storing
//key value pair for (key=nickname, value=socket object), we will see how we updated
    
var port = process.env.PORT || 4000;//finally we have port hear to run my services 
    server.listen(port);//this is how I will start which is nothing but my express application. 
    //so we did listen twice, one up line 8, and hear 19. Line 8 is to open my socket.io library and start listening,
    //on a separate socket which does the http upgrade (handshake), and start communicating using socket.io library
    //that is nothing but web sockets. so that’s the major part after that its all very simple. 

//1:26;00
app.use(express.static(__dirname + '/public'));//we are using express static on the public folder, 
app.set('view engine','ejs');//using the view engine known as ejs

app.get('/',function(req,res){//handling a single route that is the root route, 
  res.render('index');//and rendering the index.ejs, not passing any data, just rendering it
});//how does it get data, because index.ejs has socket.io calls there by raising events 
//by emitting (broadcast) events, it is directly going to talk to server, it does not have to make API request, rather it directly 
//can talk to server over the socket. index.ejs will handle using JavaScript and socket.io library. 

//1:27:00 below comes important part, we have 3 to 4 sections, one is for .on connection so below,
//what happens is, I have my io object which already being imported at the top line 8 by important socket.io,
//so below we have io object and on top of that we have sockets obj, so its nothing but my socket representation using socket io
//and finally we are registering listen on an event, so we said .on which mean I am listening on an event known as connection,
//and on receiving connection event, I am going to execute below callback function. 
io.sockets.on('connection',//you can do socket communication only when there is connection existing, that why all
//the operation we are doing exist within below callback function. We are doing handling of new user, 
//1:34:00 so upon having user connection from front end (index.js), remember we are also registering set of functions as below,
//socket.on this socket represents particular client, if you three user client then we will have three different socket obj,
//each of the function get registered to that socket individually, we will use each user connection (socket.on) to our events as below.  


//1:27:37 Execution of CALLBACK FUNCTION starts, we have lot of socket handling within this function///
//handling four events (new user, emit, send msg public/private separation, disconnect )
function(socket){ //callback function till end of the program. 
  //1:28:30 Once the connection is established, you will get socket obj, so multiple connection can happen, first of all, 
  //this is my server code, that can be multiple code, that is nothing but multiple clients connecting to same server, 
  //so each time new connection happens
  //this particular emit happens from the browser side, and my server will receive event and call this callback function below, 
  //every connection that is made to server as a separate socket obj, this object which is coming into my callback function, 
  //represents every new connection to this particular server using socket.io from various different clients. //1:29:08,         

      console.log("A New Connection Established");
//1:29:10, lets go point by point as per the flow chart, first thing is hitting the root route and rendering index.ejs), 
//lets look at index.ejs first then comeback to app.js

socket.on('new user',function(data,callback){ //handling of new user event 
//1:34:30 socket.on( frontend user connection), on thta client in the server side, I am waiting for an event known as new user from index.ejs,   
//1:34:37 - 1:38:30 (Index.ejs) Explaining on new user info 
  

        if(data in users){
          console.log("Username already taken");
          callback(false);
        }else{
          console.log("Username available");
          callback(true);
          socket.nickname=data;
          users[socket.nickname]=socket;
          updateNicknames(); 
        }
      });

      function updateNicknames(){//emit (broadcast) new user name event 
        io.sockets.emit('usernames',Object.keys(users));
      }

      socket.on('send message',function(data,callback){//handling send msg event for public and private separtion to send on right socket
        var msg=data.trim();
        if(msg.substr(0,1) === '@'){
          msg=msg.substr(1);
          var ind=msg.indexOf(' ');
          if(ind !== -1){
            var name=msg.substring(0,ind);
            var msg=msg.substring(ind+1);
             if(name in users){
                users[name].emit('whisper',{msg:msg,nick:socket.nickname});
                socket.emit('private',{msg:msg,nick:name});
              console.log("Whispering !");
            }else{
              callback("Sorry, "+name+" is not online");
            }
          }else{
            callback("Looks like you forgot to write the message");
          }

        }

         else{
         console.log("Got Message :"+data)
         io.sockets.emit('new message',{msg:msg,nick:socket.nickname});
           }
      });

      socket.on('disconnect',function(data){ //listning on disconnect event, if socket is disconnected I will do some cleanup operation 
            if(!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
      });
  }
  /// Excuation of callback funciton End///
  );
