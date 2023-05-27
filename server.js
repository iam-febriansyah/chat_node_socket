require("dotenv").config();

var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var server = require("http").createServer(app);
const methodOverride = require("method-override");
var HTTP_PORT = 2003;

// //OPEN-AI
// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

//BARD
const { BardAPI } = require("bard-api-node");
const bard = new BardAPI();

var io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
});

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(cors());
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  req.io = io;
  res.io = io;
  // console.log(io);
  // req.openai = openai;
  // res.openai = openai;
  // io.onConnect((_) => {
  //   print("socket connected ");
  // });

  // await bard.setSession("__Secure-1PSID", process.env.BARD_COOKIE_KEY);
  // res.bard = bard;
  // req.bard = bard;
  console.log("OK");
  socketOn(io);
  next();
});

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

var authRoute = require("./app/auth/router.js");
var chatRoute = require("./app/chat/router.js");
require("./db/index.js")(app);
app.use("/auth", authRoute);
app.use("/chat", chatRoute);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});

function socketOn(io) {
  console.log("SOCKET");
  io.on("connection", function (socket) {
    console.log("connection");
    console.log(socket);

    socket.on("CH01", function (from, msg) {
      console.log("MSG", from, " saying ", msg);
    });
  });

  io.on("connect_failed", function (err) {
    console.log("Connection Failed");
    console.log(err);
  });
  io.on("connect_error", (err) => {
    console.log(err.message); // prints the message associated with the error
  });
  io.on("connect", function (data) {
    // <-- this works
    console.log("socket ON connect", data);
  });
}
