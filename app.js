const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const bodyParser = require("body-parser");
const bookingControllers = require("./controllers/bookingController");
const bookingRoutes = require("./routes/bookingsRoutes");
const AppError = require("./utils/appError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const errorController = require("./controllers/errorController");

const app = express();

app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//implemented CORS
app.use(cors());

//preflight options
app.options("*", cors());

//Global MiddleWares

app.use(express.static(path.join(__dirname, "public")));

//set secure HTTP
app.use(helmet());

//development login
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//set limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP. Please try again in an hour"
});

app.use("/api", limiter);

app.post(
  "/webhook-checkout",
  bodyParser.raw({ type: "application/json" }),
  bookingControllers.webhookCheckout
);

//body parser - reading data from a body into req.body
app.use(express.json({ limit: "10kb" }));

//cookie parser
app.use(cookieParser());

//Data sanitization against noSQL query injections
app.use(mongoSanitize());
//Data sanitization against XSS attacks
app.use(xss());
//prevent parameter polution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price"
    ]
  })
);

app.use(compression());

//serving static files

app.use((req, res, next) => {
  req.time = new Date().toISOString();
  //console.log('the cookie of this section is: "', req.cookies);
  next();
});

//Routes
app.use("/", viewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRoutes);

app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `Can not find ${req.originalUrl} on this server!`
  // });
  // const err = new Error(`Can not find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can not find ${req.originalUrl} on this server!`, 400)); // everytime when we pass an argument to next() it will get as an error and pass to next erro handling middleware
});

app.use(errorController);

// Start server

module.exports = app;
