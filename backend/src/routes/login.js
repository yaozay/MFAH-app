require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getParseData = require("../utils/getParseData");
const db = require("../../db");

const SECRET_KEY = process.env.SECRET_KEY;

const handleLogin = (req, res) => {
  getParseData(req)
    .then((data) => {
      console.log("Received data:", data);
      let { email, password } = data;

      // Normalize inputs
      email = (email || "").trim().toLowerCase();
      password = (password || "").trim();

      if (!email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Email and password are required" })
        );
      }

      // Query DB for user
      db.execute("SELECT * FROM Users WHERE email = ?", [email], async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Internal Server Error" }));
        }

        if (results.length === 0) {
          res.writeHead(401, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid credentials" }));
        }

        const user = results[0];

        // Check bcrypt password
        try {
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            res.writeHead(401, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid credentials" }));
          }
        } catch (err) {
          console.error("Bcrypt error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Internal Server Error" }));
        }

        // Create JWT
        const token = jwt.sign(
          {
            id: user.user_id,
            email: user.email,
            role: user.role,
          },
          SECRET_KEY,
          { expiresIn: "2h" }
        );

        // Send response
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            token,
            id: user.user_id,
            email: user.email,
            role: user.role,
          })
        );
      });
    })
    .catch((error) => {
      console.error("Error parsing request body:", error);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid data" }));
    });
};

module.exports = {
  handleLogin,
};
