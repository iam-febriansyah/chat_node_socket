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

module.exports = {
    listUser: async (req, res) => {
        console.log("POST LIST USERS");
        try {
            var user_id = req.session.user_id;
            var users = await db.users.findAll({ where : { activate : { [Op.eq] : null }, user_id : {[Op.not]: user_id}  } })
            res.send({ status: true, remarks: "Successfuly get user list", users : users });
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
            var { to_user_id } = req.body;
            var from_user_id = req.session.user_id;
            var query = `SELECT 
                            chats.*, 
                            CASE WHEN from_user_id = '${from_user_id}' THEN '1' ELSE '0' END as is_me
                         FROM chats 
                         WHERE (from_user_id = '${from_user_id}' AND to_user_id = '${to_user_id}') OR 
                               (to_user_id = '${from_user_id}' AND from_user_id = '${to_user_id}')  
                               AND deleted_at IS NULL
                         ORDER BY created_at_server ASC`;
            var chats = await db.sequelize.query(query, { type: QueryTypes.SELECT });
            res.send({ status: true, remarks: "Successfuly get chats list", chats : chats });
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
            var { to_user_id, message, file, created_at, time_zone } = req.body;
            var from_user_id = req.session.user_id;
            var chat_id = `${from_user_id}###${to_user_id}###`+uuidv1();
            var created_at_server = help.dateTimeNow();
            
            var dataInsert = {
                chat_id : chat_id,
                from_user_id : from_user_id,
                to_user_id : to_user_id,
                message : message,
                created_at : created_at,
                time_zone : time_zone,
                created_at_server : created_at_server
            }

            var resIns = await db.chats.create(dataInsert).catch((err)=>{ console.log(err)});
            if(!resIns){ throw "Failed send message"; }

            so.sendMessage(req, to_user_id, dataInsert);

            res.send({ status: true, remarks: "Successfuly send message"});
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
            var dataUpdate = {  deleted_at : deleted_at, deleted_at_server : deleted_at_server }
            var resIns = await db.chats.update(dataUpdate, { where : { chat_id : chat_id, from_user_id : from_user_id } });
            if(resIns){ throw "Failed delete message"; }

            res.send({ status: true, remarks: "Successfuly delete message"});
        } catch (err) {
            if (err.message) {
                err = err.message;
            }
            res.send({ status: false, remarks: err });
        }
    },

};
