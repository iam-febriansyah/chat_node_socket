var express = require("express");
var router = express.Router();
const jwt = require("../jwt");

const {
    signUp,
    signIn,
    forgotPassword,
    changeForgotPassword,
    changePassword,
    activate,
    editAccount,
} = require("./controller");

router.post("/sign-up", signUp);
router.get("/activate/:id", activate);
router.post("/sign-in", signIn);
router.post("/forgot-password", forgotPassword);
router.post("/change-forgot-password", changeForgotPassword);
router.post("/change-password", [jwt.checkJwt], changePassword);
router.post("/edit-account", [jwt.checkJwt], editAccount);
module.exports = router;
