const dotenv = require("dotenv");
dotenv.config();

/**Database */
const db = require("../../db/config");
const Op = db.Sequelize.Op;

/**Library */
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { v1: uuidv1 } = require("uuid");
var jwt = require("jsonwebtoken");

/**Helpers*/
const help = require("../helper");
const so = require("../socket");

async function read(from_user_id, to_user_id, req) {
  var read_at = help.dateTimeNow();
  await db.chats
    .update(
      { read_at: read_at },
      {
        where: {
          read_at: { [Op.eq]: null },
          to_user_id: from_user_id,
          from_user_id: to_user_id,
        },
      }
    )
    .catch((err) => {
      console.log(err);
      return false;
    });
  so.readMessage(req, to_user_id, true);
}

module.exports = {
  read,

  listUser: async (req, res) => {
    console.log("POST LIST USERS");
    try {
      var { page, search } = req.body;
      var limit = 10;
      var user_id = req.session.user_id;
      var users = await db.users.findAll({
        where: { activate: { [Op.eq]: null }, user_id: { [Op.not]: user_id }, email: { [Op.substring]: search } },
        offset: (page - 1) * limit,
        limit: limit,
        subQuery: false,
        include: [
          {
            model: db.user_details,
            required: true,
            where: { fullname: { [Op.substring]: search } },
          },
        ],
      });
      var bot = {
        user_id : 'bot',
        email : 'bard@google.com',
        password : '',
        forgot_code : '',
        activate : '',
        created_at : '',
        is_online : 'Online',
        update_at : '',
        user_detail : {
          user_detail_id : 'bot',
          user_id : 'bot',
          fullname : 'Bard AI',
          status : '',
          status_update : '',
          created_at : '',
        }
      }
      var datas = [];
      datas.push(bot);
      for (let i = 0; i < users.length; i++) {
        const e = users[i];
        datas.push(e);
      }
      res.send({ status: true, remarks: "Successfuly get user list", user_list: datas });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  listChatUser: async (req, res) => {
    console.log("POST CHAT USER");
    try {
      var { to_user_id, page } = req.body;
      var limit = 20;
      var from_user_id = req.session.user_id;
      var query = {
        attributes: ["*", [db.Sequelize.literal(`CASE WHEN from_user_id = '${from_user_id}' THEN '1' ELSE '0' END`), "is_me"]],
        where: {
          deleted_at: { [Op.eq]: null },
          [Op.or]: [
            { from_user_id: from_user_id, to_user_id: to_user_id },
            { to_user_id: from_user_id, from_user_id: to_user_id },
          ],
        },
        raw: true,
        offset: (page - 1) * limit,
        limit: limit,
        subQuery: false,
        order: [["created_at_server", "DESC"]],
      };
      var chats = await db.chats.findAll(query).catch((err) => {
        console.log(err);
        return false;
      });
      res.send({ status: true, remarks: "Successfuly get chats list", chats: chats });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  sendMessage: async (req, res) => {
    console.log("POST SEND MESSAGE");
    try {
      var { chat_id, to_user_id, message, file, created_at, time_zone } = req.body;
      var from_user_id = req.session.user_id;
      if (to_user_id == "bot") {
        var reply = so.replyFromBot(req, from_user_id, message);
        res.send({ status: true, remarks: "Successfuly send message", reply: reply });
      } else {
        if (chat_id == "" || typeof chat_id == "undefined") {
          chat_id = `${from_user_id}###${to_user_id}###` + uuidv1();
        }
        var created_at_server = help.dateTimeNow();

        var dataInsert = {
          chat_id: chat_id,
          from_user_id: from_user_id,
          to_user_id: to_user_id,
          message: message,
          created_at: created_at,
          time_zone: time_zone,
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

        so.sendMessage(req, to_user_id, resIns);

        res.send({ status: true, remarks: "Successfuly send message" });
      }
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  deleteMessage: async (req, res) => {
    console.log("POST DELETE MESSAGE");
    try {
      var { chat_id, deleted_at } = req.body;
      var from_user_id = req.session.user_id;
      var deleted_at_server = help.dateTimeNow();
      var dataUpdate = { deleted_at: deleted_at, deleted_at_server: deleted_at_server };
      var resIns = await db.chats.update(dataUpdate, { where: { chat_id: chat_id, from_user_id: from_user_id } });
      if (resIns) {
        throw "Failed delete message";
      }

      res.send({ status: true, remarks: "Successfuly delete message" });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  readMessage: async (req, res) => {
    console.log("POST READ MESSAGE");
    try {
      var { to_user_id } = req.body;
      var from_user_id = req.session.user_id;
      await read(from_user_id, to_user_id, req);
      res.send({ status: true, remarks: "Successfuly read message" });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },
};
