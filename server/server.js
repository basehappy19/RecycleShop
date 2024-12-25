const express = require("express");
const { readdirSync } = require("fs");
const morgan = require("morgan");
const cors = require("cors");
const bodyParse = require("body-parser");

require("dotenv").config();

const PORT = process.env.PORT;

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParse.json({ limit: "10mb" }));
app.use("/Uploads", express.static("Uploads"));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/sendBottle', (req, res) => {
    res.render('index');
});

readdirSync("./Routes").map((r) => app.use("/api", require("./Routes/" + r)));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
