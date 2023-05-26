const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

const checkJwt = (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) {
        res.send({ status: false, remarks: "Token not provided!" });
    }
    jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
        if (err) {
            res.send({ status: false, remarks: "Unauthorized" });
        }
        req.session = {
            user_id : decoded.user_id,
            email : decoded.email,
            fullname : decoded.fullname,
        }
        next();
    });
};
module.exports = { checkJwt };
  