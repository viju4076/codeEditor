const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4:uuidV4} = require('uuid')
var fs=require('fs')
var request = require('request');
const { captureRejectionSymbol } = require('events')
var currentLanguage='cpp14';



var program = {
    
        clientId:"126b0727644f6a29367df1ac3f03588d",
        clientSecret:"b7050cdede2a8e18aa25723dbc57865a14126a1ec601fb831fc41aae8eb81408",
        script: "<?php echo \"hello\"; ?>",
        language: "cpp14",
        versionIndex:"0" ,
        stdin:""
  
};

// request({
//     url: 'https://api.jdoodle.com/v1/execute',
//     method: "POST",
//     json: program
   
// },
// function (error, response, body) {
   
//     console.log('error:', error);
//     console.log('statusCode:', response && response.statusCode);
//     console.log('body:', body);
// });

app.set('view engine','ejs');
//app.use("/public", express.static('public'));

app.use(express.static(__dirname+"/public"));

// app.get('/',(req,res)=>{
//     res.redirect(`/${uuidV4()}`)
// })

// app.get('/:room',(req,res)=>{
//     res.render('front',{roomId:req.params.room})
// })

app.get('/',(req,res)=>{
    res.redirect(`/${uuidV4()}/interviewer`)
})

app.get('/:room',(req,res)=>{
    res.redirect(`/${req.params.room}/candidate`);
})

app.get('/:room/interviewer',(req,res)=>{
    var ques='You can add a question here'
    res.render('front',{roomId:req.params.room, user:'Interviewer',quesDes:ques});

})
app.get('/:room/candidate',(req,res)=>{
    var ques='Wait until interviewer assigns you a question';
    res.render('front',{roomId:req.params.room,user:'Candidate',quesDes:ques})
});


var chats=[];
io.on('connection',socket=>{
    
   
         
    //console.log('hello');
    socket.on('join-room',(roomId,userId)=>{
            console.log("room:"+roomId +"socket id: "+socket.id)
            socket.join(roomId);
            socket.to(roomId).emit('user-connected',userId);
            io.to(socket.id).emit('previous_chats', chats);
            socket.on('disconnect',()=>{
                socket.to(roomId).broadcast.emit('user-disconnected',userId)
            })
            //console.log(user);
            
            socket.on('codeboard-message', function(data){
                // console.log(data);
                chats.push(data);
                socket.broadcast.to(roomId).emit('message-from-others', data);
                //console.log(chats);
            })
             
            socket.on('category',(selText,tabId)=>{
                console.log('hello');
                var num=Math.floor((Math.random() * 2) + 1);
                var ques=''+fs.readFileSync('./problems_db/'+selText+'/p'+num);
                console.log
             //   socket.to(roomId).emit('changeQues',ques,tabId);
                io.to(roomId).emit('changeQues',ques,tabId);
            })
             socket.on('change_i',(i)=>{
                 socket.to(roomId).emit('change_i',i);
             })
             
            socket.on('editor-change',(code)=>{
                
                 socket.to(roomId).emit('editor-change',code)
            })
            socket.on('inputChange',(input)=>{
               // console.log(input);
                socket.to(roomId).emit('inputChange',input)
                
            })
            socket.on('add_ques_tab',function(){
                console.log('here')
              //  socket.to(roomId).emit('add_ques_tab_event');
                io.to(roomId).emit('add_ques_tab_event');
            })
            socket.on('selectIndex',(language)=>{
                 socket.to(roomId).emit('selectIndex',language)
            })
            socket.on('currentLanguage',(language)=>{
                currentLanguage=language;
            })
            // socket.on('codeSubmit',(msg)=>{
            //     socket.to(roomId).emit('codeSubmit',msg)
            // })
            socket.on('submitCode',(input_code)=>{
              //  console.log(input_code);
              console.log(input_code.code);
                program.script=input_code.code;
                program.language=currentLanguage;
                program.stdin=input_code.input;
                  request({
               url: 'https://api.jdoodle.com/v1/execute',
            method: "POST",
                json: program
   
},
function (error, response, body) {
   
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
    socket.emit('codeResult',body);
   // result.textContent=body;
   io.to(roomId).emit('codeResult',body);
});





            })
    })
})
server.listen(8080) 




// Client ID 
// 126b0727644f6a29367df1ac3f03588d
// Client Secret 
// b7050cdede2a8e18aa25723dbc57865a14126a1ec601fb831fc41aae8eb81408
