const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const errorMiddleware = require("./backend/middleware/error");

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}


app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());
app.use(cookieParser());
app.use(fileUpload());


// Passport configuration
// passport.use(new LocalStrategy(
//   (username, password, done) => {
//     // Implement your authentication logic here
//   }
// ));

// Serialize and deserialize user
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   // Retrieve user from the database based on 'id'
//   done(null, user);
// });


app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '/tmp/')
}));
app.use(cors());



// Route Imports

const candidate = require("./backend/routes/candidateRoute");
const questionBank = require("./backend/routes/questionBankRoute");

app.use("/api/v1", candidate);
app.use("/api/v1", questionBank);


// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
