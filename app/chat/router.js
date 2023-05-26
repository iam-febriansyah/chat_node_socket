var express = require("express");
var router = express.Router();
const jwt = require("../jwt");

const { listUser, listChatUser, sendMessage, deleteMessage } = require("./controller");

router.post("/list-user", [jwt.checkJwt], listUser);
router.post("/list-chat-user", [jwt.checkJwt], listChatUser);
router.post("/send-message", [jwt.checkJwt],  sendMessage);
router.post("/delete-message", [jwt.checkJwt],  deleteMessage);
module.exports = router;
