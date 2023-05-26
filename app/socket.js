
/**Database */
const db = require("../db/config");
const Op = db.Sequelize.Op;


const help = require("../app/helper");

function sendMessage(req, to_user_id, param) {
    var io = req.io;
    if(io != null || typeof io != 'undefined'){
        io.emit("sendMessage_" + to_user_id, param);
    }
}

function readMessage(req, to_user_id, param) {
    var io = req.io;
    if(io != null || typeof io != 'undefined'){
        io.emit("readMessage_" + to_user_id, param);
    }
}

async function replyFromBot(req, user_id, param) {
    try {
        var io = req.io;

        /*var openai = req.openai;
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: param,
        });
        if(response.data.choices?.length > 0){
            const message = response.data.choices[0].text;
            if(io != null || typeof io != 'undefined'){
                io.emit("bot_" + user_id, message);
            }
            return message;
        }*/
        
        var bard = req.bard;
        const response = await bard.getBardResponse(param);
        if(response){
            if(io != null || typeof io != 'undefined'){
                io.emit("bot_" + user_id, response);
            }
            console.log(response)
            return response.content;
        }
        return null;
    } catch (error) {
        console.log('replyFromBot', error)
        return null;
    }
   
}

function setSocketUser(req, user_id){
    var socket = req.io;

    //Set online or offline
    socket.on(`online_${user_id}`, async function(data){
        socket.emit(`online_${user_id}`, data);
        await db.users.update({ is_online : help.dateTimeNow() }, { where : { user_id : user_id } })
    });

    //Set typing
    socket.on(`typing_${user_id}`, async function(data){
        var to_user_id = data?.to_user_id;
        var message = data?.message;
        socket.emit(`typing_${user_id}_${to_user_id}`, message);
    });

    //Reply from bot
    socket.on(`typing_${user_id}`, async function(data){
        var to_user_id = data?.to_user_id;
        var message = data?.message;
        
    });
}

module.exports = {
    sendMessage,
    readMessage,
    setSocketUser,
    replyFromBot
};