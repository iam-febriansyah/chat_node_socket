function sendMessage(req, to_user_id, param) {
    var io = req.io;
    if(io != null || typeof io != 'undefined'){
        io.emit("sendMessage_" + to_user_id, param);
    }
}

module.exports = {
    sendMessage
};