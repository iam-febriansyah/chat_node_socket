const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

const db = require("../db/config");
const Op = db.Sequelize.Op;

const checkJwt = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) {
    res.send({ status: false, remarks: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
    if (err) {
      res.send({ status: false, remarks: "Unauthorized" });
    }
    var cek = await db.users.findOne({
      where: { user_id: decoded.user_id, activate: { [Op.eq]: null } },
    });

    if (!cek) {
      res.send({ status: false, remarks: "Unauthorized" });
    }

    req.session = {
      user_id: decoded.user_id,
      email: decoded.email,
      fullname: decoded.fullname,
    };
    next();
  });
};
module.exports = { checkJwt };
