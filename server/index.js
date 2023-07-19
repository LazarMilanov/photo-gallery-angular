const express = require("express");
const router = express.Router();
const fs = require("fs");

const cors = require("cors");
const https = require("https");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});

const mongoose = require("mongoose");

const PORT = process.env.PORT || 13001;

mongoose.connect(process.env.MONGODB_URL_CLOUD, {
    dbName: process.env.DBNAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("[INFO] Connected to MongoDB");
}).catch((err) => {
    console.log(`[ERROR] Failed to connect: ${err}`);
});

const app = express();
const api = require("./routes/api");

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended:false, limit: "5mb" }));
app.use(cors({origin: [process.env.CLIENT_URL]}));
app.use("/api/v1", api);

const httpsServer = https.createServer({
    key: fs.readFileSync("./keys/private.pem"), 
    cert: fs.readFileSync("./keys/public.pem")
}, app);

httpsServer.listen(PORT, () => {
    console.log(`[INFO] Server started running at port: ${PORT}`);
})