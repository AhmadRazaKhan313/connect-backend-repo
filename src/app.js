const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const passport = require("passport");
const httpStatus = require("http-status");
const { jwtStrategy } = require("./config/passport");
const routes = require("./routes/v1");
const { errorConverter, errorHandler } = require("./middlewares/error");
const cron = require("node-cron-tz");
const ApiError = require("./utils/ApiError");
const summaryController = require("./modules/summary/summary.controller");
const { Mutex } = require("async-mutex");
const mutex = new Mutex();
const subdomainMiddleware = require("./middlewares/subdomain");



const app = express();

// enable cors — MUST be before body parsers so CORS headers are always present
app.use(cors());
app.options("*", cors());

// set security HTTP headers
app.use(helmet());

// before Auth middleware
app.use(subdomainMiddleware);

// parse json request body — 10mb limit for base64 logo uploads
app.use(express.json({ limit: '10mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// v1 api routes
app.use("/api/v1", routes);
app.use("/api/v1/test", async (req, res) => {
  res.send(`Server is successfully up`);
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

cron.schedule(
  "00 12 * * *",
  async () => {
    const release = await mutex.acquire();
    try {
      console.log("Cron job started at:", new Date().toISOString());
      await summaryController.sendEmailsAndMessagesForTomorrowExpiry();
      console.log("Cron job finished at:", new Date().toISOString());
    } finally {
      release();
    }
  },
  {
    timezone: "Asia/Karachi",
  }
);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;