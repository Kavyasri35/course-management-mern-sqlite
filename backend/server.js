const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    [name, email, hash],
    (err) => {
      if (err) return res.status(400).json({ message: "User exists" });
      res.json({ message: "Registered successfully" });
    }
  );
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email=?", [email], async (err, user) => {
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, "secret");
    res.json({ token });
  });
});

app.get("/api/courses", (req, res) => {
  db.all("SELECT * FROM courses", [], (err, rows) => {
    res.json(rows);
  });
});

app.post("/api/courses", (req, res) => {
  const { title, description } = req.body;
  db.run(
    "INSERT INTO courses (title,description) VALUES (?,?)",
    [title, description],
    () => res.json({ message: "Course added" })
  );
});

app.listen(5000, () => console.log("Server running on port 5000"));
