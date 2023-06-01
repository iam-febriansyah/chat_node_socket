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
  signUp: async (req, res) => {
    console.log("POST SIGN UP");
    try {
      var { email, password, fullname } = req.body;
      console.log(req.body);
      if (email == "" || typeof email == "undefined") {
        throw "Please enter email";
      }
      if (password == "" || typeof password == "undefined") {
        throw "Please enter password";
      }
      if (fullname == "" || typeof fullname == "undefined") {
        throw "Please enter fullname";
      }
      var validateMail = await help.isEmailValid(email);
      if (!validateMail) {
        throw "Invalid mail";
      }
      var cek = await db.users.findOne({ where: { email: email.trim() } });
      if (cek) {
        throw "Email already exist";
      }

      var user_id = uuidv1();
      var activate = uuidv1();
      var activateUrl = help.baseurl(req) + "/auth/activate/" + activate;
      const hashedPassword = await bcrypt.hash(password, 10);
      var dataInsert = {
        user_id: user_id,
        email: email.trim(),
        password: hashedPassword,
        activate: activate,
        created_at: help.dateTimeNow(),
      };
      var resIns = await db.users.create(dataInsert);
      if (resIns) {
        dataInsert = {
          user_detail_id: uuidv1(),
          user_id: user_id,
          fullname: fullname.trim(),
          created_at: help.dateTimeNow(),
        };
        resIns = await db.user_details.create(dataInsert);
      }

      if (!resIns) {
        await db.users.destroy({ where: { email: email } });
        throw "Failed sign up";
      }

      var email = await help.sendMail(email.trim(), "Activate Account", "Activate your account with click link below<br>" + activateUrl, null);
      res.send({ status: true, remarks: "Successfuly sign up", activate: activateUrl });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  activate: async (req, res) => {
    console.log("GET ACTIVATE");
    try {
      var id = req.params?.id;
      if (id == "" || typeof id == "undefined") {
        throw "Unknown parameter";
      }

      var cek = await db.users.findOne({ where: { activate: id } });
      if (!cek) {
        throw "Invalid ID";
      }

      const update = await db.users.update({ activate: null }, { where: { activate: id } });
      if (!update) {
        throw "Failed activated";
      }

      res.send({
        status: true,
        remarks: "Successfully activated",
      });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  signIn: async (req, res) => {
    console.log("POST SIGN IN");
    try {
      var { email, password } = req.body;
      if (email == "" || typeof email == "undefined") {
        throw "Please enter email";
      }
      if (password == "" || typeof password == "undefined") {
        throw "Please enter password";
      }
      var cek = await db.users.findOne({
        where: { email: email.trim(), activate: { [Op.eq]: null } },
      });
      if (!cek) {
        throw "Email doesn't exist";
      }
      const checkPassword = await bcrypt.compare(password, cek.password);
      if (!checkPassword) {
        throw "Invalid password";
      }
      var cekD = await db.user_details.findOne({
        where: { user_id: cek.user_id },
      });
      if (!cekD) {
        throw "Detail user doesn't exist";
      }
      var token = jwt.sign({ user_id: cek.user_id, email: cek.email, fullname: cekD.fullname }, process.env.JWT_KEY, {
        expiresIn: "365d",
      });

      res.send({
        status: true,
        remarks: "Successfuly sign in",
        token: token,
        user: cek,
        user_detail: cekD,
      });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  forgotPassword: async (req, res) => {
    console.log("POST FORGOT PASSWORD");
    try {
      var { email } = req.body;
      if (email == "" || typeof email == "undefined") {
        throw "Please enter email";
      }
      var cek = await db.users.findOne({
        where: { email: email.trim() },
      });
      if (!cek) {
        throw "Email doesn't exist";
      }
      var code = help.randonAlpha(6);
      const update = await db.users.update({ forgot_code: code }, { where: { email: email } });
      if (!update) {
        throw "Failed get code";
      }
      var email = await help.sendMail(email.trim(), "Forgot Password", "Your Code " + code, null);
      res.send({
        status: true,
        remarks: "Successfuly forgot password, please check your mail",
      });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  changeForgotPassword: async (req, res) => {
    console.log("POST CHANGE FORGOT PASSWORD");
    try {
      var { email, new_password, code } = req.body;
      if (email == "" || typeof email == "undefined") {
        throw "Please enter email";
      }
      if (new_password == "" || typeof new_password == "undefined") {
        throw "Please enter password";
      }
      if (code == "" || typeof code == "undefined") {
        throw "Please enter code";
      }
      var cek = await db.users.findOne({
        where: { email: email.trim() },
      });
      if (!cek) {
        throw "Email doesn't exist";
      }
      if (cek.forgot_code != code) {
        throw "Code not same";
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      const update = await db.users.update({ password: hashedPassword }, { where: { email: email } });
      if (!update) {
        throw "Failed change password";
      }
      var email = await help.sendMail(email.trim(), "Successfully Change Password", "Congratulation to succes change your password!", null);
      res.send({
        status: true,
        remarks: "Successfuly change password",
      });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  changePassword: async (req, res) => {
    console.log("POST CHANGE PASSWORD");
    try {
      var { new_password, confirm_new_password } = req.body;

      if (new_password == "" || typeof new_password == "undefined") {
        throw "Please enter password";
      }
      if (confirm_new_password == "" || typeof confirm_new_password == "undefined") {
        throw "Please enter confirm new password";
      }
      if (confirm_new_password !== new_password) {
        throw "Wrong confirm new password";
      }

      var cek = await db.users.findOne({ where: { user_id: req.session.user_id } });
      if (!cek) {
        throw "User doesn't exist";
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      const update = await db.users.update({ password: hashedPassword }, { where: { user_id: req.session.user_id } });
      if (!update) {
        throw "Failed change password";
      }

      res.send({
        status: true,
        remarks: "Successfuly change password",
      });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },

  editAccount: async (req, res) => {
    console.log("POST EDIT ACCOUNT");
    try {
      var { fullname, email } = req.body;
      if (email == "" || typeof email == "undefined") {
        throw "Please enter email";
      }
      if (fullname == "" || typeof fullname == "undefined") {
        throw "Please enter old password";
      }
      var validateMail = await help.isEmailValid(email);
      if (!validateMail) {
        throw "Invalid mail";
      }

      var cek = await db.users.findOne({ where: { user_id: req.session.user_id } });
      if (!cek) {
        throw "User doesn't exist";
      }

      if (email != cek.email) {
        var cek = await db.users.findOne({ where: { email: email } });
        if (cek) {
          throw "Email already exist";
        }

        const update = await db.users.update({ email: email }, { where: { user_id: req.session.user_id } });
        if (!update) {
          throw "Failed edit account email";
        }
      }

      const updateD = await db.user_details.update({ fullname: fullname }, { where: { user_id: req.session.user_id } });
      if (!updateD) {
        throw "Failed edit account name";
      }

      var token = jwt.sign({ user_id: cek.user_id, email: cek.email, fullname: fullname }, process.env.JWT_KEY, {
        expiresIn: "365d",
      });

      res.send({
        status: true,
        remarks: "Successfuly edit account",
        token: token,
      });
    } catch (err) {
      if (err.message) {
        err = err.message;
      }
      res.send({ status: false, remarks: err });
    }
  },
};
