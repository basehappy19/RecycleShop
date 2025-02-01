const dotenv = require("dotenv");
const express = require("express");
const { readdirSync } = require("fs");
const morgan = require("morgan");
const cors = require("cors");
const bodyParse = require("body-parser");
const helmet = require("helmet");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const rateLimiter = new RateLimiterMemory({ points: 20, duration: 1 });

const app = express();

dotenv.config();
if (process.env.NODE_ENV === "production") {
    app.use(helmet());
    app.use(morgan("combined"));
} else {
    app.use(morgan("dev"));
}

const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParse.json({ limit: "10mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/Uploads", express.static("Uploads"));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/sendBottle', (req, res) => {
    res.render('index');
});

app.use(async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch {
        res.status(429).send("Too Many Requests");
    }
});

readdirSync("./Routes").map((r) => app.use("/api", require("./Routes/" + r)));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
