const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const dotenv = require('dotenv').config();

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const user = require("./routes/users");
const vender = require("./routes/vender");

const PORT = process.env.PORT || 8000;

app.use("/api/user", user);
app.use("/api/vender", vender);

server.listen(PORT, () => {
  console.log(`\u001b[1;32mServer is listening on PORT: ${PORT}`);
});
