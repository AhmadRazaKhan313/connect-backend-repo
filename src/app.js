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
const { sendTemplateForExpiry } = require("./services/email.service");
const summaryController = require("./modules/summary/summary.controller");
const { EntryModel } = require("./models");
const { Mutex } = require("async-mutex");
const mutex = new Mutex();
const subdomainMiddleware = require("./middlewares/subdomain");
const { OrganizationModel } = require("./models");



const app = express();

// set security HTTP headers
app.use(helmet());


// before Auth middleware
app.use(subdomainMiddleware);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use(async (req, res, next) => {
    const host = req.headers.host;
    // karachi.local:4000 → parts = ["karachi", "local:4000"]
    const parts = host.split(".");
    const subdomain = parts[0];

    const ignored = ["localhost", "local", "www", "127", "api"];

    if (ignored.includes(subdomain) || parts.length < 2) {
        return next();
    }

    try {
        const org = await OrganizationModel
            .findOne({ subdomain });
        if (org) {
            req.organizationId = org._id;
        }
    } catch (err) {
        console.log('Subdomain error:', err);
    }

    next();
});

app.use("/api/v1", routes);

// v1 api routes
app.use("/api/v1", routes);
app.use("/api/v1/test", async (req, res) => {
  res.send(`Server is successfully up`);
});

app.use('/whatsapp', async (req, res) => {
  const response = await sendTemplateForExpiry("923062244907", 'Haseeb', '1', '123', 'Tuesday')
  res.send(response)
})

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
