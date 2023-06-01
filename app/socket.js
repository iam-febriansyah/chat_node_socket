/**Database */
const db = require("../db/config");
const Op = db.Sequelize.Op;
const { v1: uuidv1 } = require("uuid");

const help = require("../app/helper");

function sendMessage(req, to_user_id, param) {
  var io = req.io;
  if (io != null || typeof io != "undefined") {
    console.log("sendMessage_" + to_user_id);
    io.emit("sendMessage_" + to_user_id, param);
  }
}

function readMessage(req, to_user_id, param) {
  var io = req.io;
  if (io != null || typeof io != "undefined") {
    io.emit("readMessage_" + to_user_id, param);
  }
}

async function replyFromBot(req, user_id, param) {
  try {
    var io = req.io;
    var bard = req.bard;
    const response = await bard.getBardResponse(param);
    if (response) {
      console.log(response)
      if (io != null || typeof io != "undefined") {
        var created_at_server = help.dateTimeNow();
        var dataInsert = {
          chat_id: uuidv1(),
          from_user_id: 'bot',
          to_user_id: user_id,
          message: response.content,
          created_at: created_at_server,
          time_zone: '07:00',
          created_at_server: created_at_server,
        };

        var resIns = await db.chats
          .create(dataInsert)
          .then((res) => {
            return res;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
        if (!resIns) {
          throw "Failed send message";
        }
        io.emit("bot_" + user_id, dataInsert);
      }
      console.log(response);
      return response.content;
    }
    return null;
  } catch (error) {
    console.log("replyFromBot", error);
    return null;
  }
}

function setSocketUser(socket, user_id) {
  //Set online or offline
  socket.on(`online_${user_id}`, async function (data) {
    if (data != "Online") {
      data = help.dateTimeNow();
    }
    await db.users.update({ is_online: data }, { where: { user_id: user_id } });
    socket.emit(`online_${user_id}`, data);
  });

  //Set typing
  socket.on(`typing_${user_id}`, async function (data) {
    var to_user_id = data?.to_user_id;
    var message = data?.message;
    socket.emit(`typing_${user_id}_${to_user_id}`, message); //user_id is writer, to_user_id is receiver
  });
}

function socketOn(io){
  io.on('connection', async function (socket) {
    var users = await db.users.findAll({ where: { activate: { [Op.eq]: null } } });
    for (let i = 0; i < users.length; i++) {
      const user_id = users[i].user_id;
      setSocketUser(socket, user_id)
    }
  });
}

module.exports = {
  sendMessage,
  readMessage,
  setSocketUser,
  replyFromBot,
  socketOn
};
