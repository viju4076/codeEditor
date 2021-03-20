const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4:uuidV4} = require('uuid')
var fs=require('fs')
var request = require('request');
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
    var ques=''+fs.readFileSync('./problems_db/implementation/p1');
    res.render('front',{roomId:req.params.room, user:'Interviewer',quesDes:ques});

})
app.get('/:room/candidate',(req,res)=>{
    res.render('front',{roomId:req.params.room,user:'Candidate'})
});



io.on('connection',socket=>{
    
   

    socket.on('join-room',(roomId)=>{
        //  console.log("room:"+roomId +"socket id: "+socket.id)
            socket.join(roomId);
            socket.to(roomId).emit('user-connected','userConnected');
            // socket.on('disconnect',()=>{
            //     socket.to(roomId).emit('user-disconnected',userid)
            // });
            socket.on('chat', function(data){
                // console.log(data);
                io.sockets.to(roomId).emit('chat', data);
                //console.log(data);
            })
            socket.on('typing', function(data){
                socket.broadcast.emit('typing', data);
            });

            socket.on('editor-change',(code)=>{
                //console.log(code)
                 socket.to(roomId).emit('editor-change',code)
            })
            socket.on('inputChange',(input)=>{
               // console.log(input);
                socket.to(roomId).emit('inputChange',input)
                
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
                console.log(input_code);
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
