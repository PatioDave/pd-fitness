const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let members = [
  { id: 1, name: "John Doe", checked_in: false },
  { id: 2, name: "Jane Smith", checked_in: true },
];

// GET
app.get("/api/members", (req, res) => {
  res.json(members);
});

// POST
app.post("/api/members", (req, res) => {
  const newMember = {
    id: members.length + 1,
    name: req.body.name,
    checked_in: false,
  };
  members.push(newMember);
  res.json(newMember);
});

//patch
app.patch("/api/members/:id/checkin", (req, res) => {
  const id = Number(req.params.id);

  const member = members.find((m) => m.id === id);

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  member.checked_in = !member.checked_in;

  res.json(member);
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});