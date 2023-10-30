const dotenv = require("dotenv");
const multer = require("multer");
const express = require("express");
const session = require("express-session");
const mysql = require("mysql");

const app = express();

app.use(express.json()); // JSON Data.
app.set("view engine", "ejs"); // View Engine.
app.use(express.urlencoded({ extended: true })); //Form Data.
app.use(express.static(__dirname + "/public")); // Static File (CSS | JS).
app.use(
  // Session Handling.
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
  })
);

dotenv.config(); // dotenv Configuration.

const upload = multer({ dest: "uploads/" }); // multer Configuration.
app.use(express.static("uploads")); // Static File (Multer).
app.use("/user", express.static("uploads")); // Static File (Multer).
app.use("/auth", express.static("uploads")); // Static File (Multer).
app.use("/seller", express.static("uploads")); // Static File (Multer).
app.use(upload.single("file")); // multer middleware - single upload.

// MySQL Connection:
module.exports.db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Anant@7015",
  database: "e-commerce",
});

app.use("/", require("./routes/index.js"));

app.listen(8080, () => {
  console.log("server is up and running on port 8080.");
});
