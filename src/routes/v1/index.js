const express = require("express");
const userRoute = require("./user.route");

const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Reroute all API requests beginning with the `/v1/users` route to Express router in user.route.js
const defaultRoutes = [
    {
      path: "/users",
      route: userRoute,
    },
  ];
  
  defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });

module.exports = router;
