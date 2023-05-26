const nodemailer = require("nodemailer");
const emailValidator = require('deep-email-validator');


const dateTimeNow = (now = "") => {
    let today = now == "" ? new Date() : new Date(now);
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0");
    let yyyy = today.getFullYear();
    let hh = String(today.getHours()).padStart(2, "0");
    let ii = String(today.getMinutes()).padStart(2, "0");
    let ss = String(today.getSeconds()).padStart(2, "0");
    today = `${yyyy}-${mm}-${dd} ${hh}:${ii}:${ss}`;
    return today;
};

function randonNumAlpha(length) {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}

function randonNum(length) {
    let result = "";
    const characters = "0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}

function randonAlpha(length) {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}

async function sendMail(to, subject, body, attachments) {
    try {
        if(!await isEmailValid(to)){
            return { status: false, remarks: "Invalid mail" };
        }
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                auth: {
                    user: "febriansyah.dev@gmail.com",
                    pass: "ljtxhakkqvwnhyzl",
                },
                secureConnection: "false",
                tls: {
                    ciphers: "SSLv3",
                },
            });

            var mailOption = {
                from: "no-reply - Your App here <febriansyah.dev@gmail.com>",
                to: to,
                subject: subject,
                html: body,
                attachments: attachments,
            };

            return transporter.sendMail(mailOption, function (error, info) {
                if (error) {
                    resolve({
                        status: true,
                        remarks: error.message.toString(),
                    });
                } else {
                    resolve({ status: false, remarks: info.response });
                }
            });
        });
    } catch (error) {
        return { status: false, remarks: error };
    }
}

function baseurl(req) {
    var hostname = req.headers.host;
    return process.env.HTTP + "" + hostname;
}

async function isEmailValid(email) {
    return emailValidator.validate(email)
}

module.exports = {
    dateTimeNow,
    randonAlpha,
    randonNum,
    randonNumAlpha,
    sendMail,
    baseurl,
    isEmailValid
};
