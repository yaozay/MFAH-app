require("dotenv").config();
const bcrypt = require("bcryptjs");
const getParseData = require("../utils/getParseData");
const db = require("../../db");

const handleRegister = (req, res) => {
  getParseData(req)
    .then(async (data) => {
      console.log("Received data:", data);
      let { firstName, lastName, email, password, role } = data;

      // Normalize inputs
      firstName = (firstName || "").trim();
      lastName = (lastName || "").trim();
      email = (email || "").trim().toLowerCase();
      password = (password || "").trim();
      role = (role || "visitor").trim();

      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Email and password are required" })
        );
      }

      // Check if email already exists 
      db.execute("SELECT * FROM Users WHERE email = ?", [email], async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Internal Server Error" }));
        }

        if (results.length > 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Email already registered" }));
        }

        try {
          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert user with lowercase email
          db.execute(
            "INSERT INTO Users (first_name, last_name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
            [firstName, lastName, email, hashedPassword, role],
            (err, results) => {
              if (err) {
                console.error("Database error on insert:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Internal Server Error" }));
              }

              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  message: "User registered successfully",
                  userId: results.insertId,
                  firstName,
                  lastName,
                  email,
                  role,
                })
              );
            }
          );
        } catch (hashError) {
          console.error("Password hash error:", hashError);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
      });
    })
    .catch((error) => {
      console.error("Error parsing request body:", error);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid data" }));
    });
};

module.exports = {
  handleRegister,
};
