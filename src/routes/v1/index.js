const express = require("express");
const router = express.Router();
const ROUTES = require('./ROUTES')

ROUTES.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
