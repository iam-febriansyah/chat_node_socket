var express = require("express");
var app = express();
var server = require("http").createServer(app); 
var HTTP_PORT = 2003;

var io = require("socket.io")(server, {
  cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  allowEIO3: true,
});

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) { req.io = io; res.io = io; next(); });
app.set("io", io); 

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

var authRoute = require("./app/auth/router.js");
var chatRoute = require("./app/chat/router.js");
require("./db/index.js")(app);
app.use("/auth", authRoute);
app.use("/chat", chatRoute);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});


