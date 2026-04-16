// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function App() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scanInput, setScanInput] = useState("");
  const inputRef = useRef(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3001/api/members");
      if (!res.ok) throw new Error("Failed to load members");

      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message || "Error loading members");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!name.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to add member");

      const newMember = await res.json();
      setMembers((prev) => [...prev, newMember]);
      setName("");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteMember = async (id) => {
  try {
    const res = await fetch(`http://localhost:3001/api/members/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");

    setMembers((prev) => prev.filter((m) => m.id !== id));
  } catch (err) {
    alert(err.message);
  }
};

const toggleCheckIn = async (id) => {
  try {
    const res = await fetch(`http://localhost:3001/api/members/${id}/checkin`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Failed to toggle");

    const updated = await res.json();

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? updated : m))
    );
  } catch (err) {
    alert(err.message);
  }
};

const importCSV = async (file) => {
  const text = await file.text();
  const names = text.split("\n").map((n) => n.trim()).filter(Boolean);

  for (const name of names) {
    await fetch("http://localhost:3001/api/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
  }

  loadMembers();
};

const scanCheckIn = async (id) => {
  try {
    const res = await fetch(`http://localhost:3001/api/members/${id}/checkin`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Scan failed");

    const updated = await res.json();

    setMembers((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  } catch (err) {
    alert(err.message);
  }
};

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
  inputRef.current?.focus();
}, []);

  if (loading) return <div style={{ padding: 20 }}>Loading members...</div>;
  if (error) return <div style={{ padding: 20 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>PD Fitness Members</h1>

      <div style={{ marginBottom: 20 }}>
  <input
    ref={inputRef}
    value={scanInput}
    onChange={(e) => setScanInput(e.target.value)}
    placeholder="Scan member ID"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        if (!scanInput) return;
        scanCheckIn(Number(scanInput));
        setScanInput("");
      }
    }}
  />

  <button
    onClick={() => {
      if (!scanInput) return;
      scanCheckIn(Number(scanInput));
      setScanInput("");
    }}
    style={{ marginLeft: 10 }}
  >
    Scan
  </button>
</div>

      <div style={{ display: "none" }}>
  <input
    type="file"
    accept=".csv"
    onChange={(e) => {
      if (e.target.files[0]) {
        importCSV(e.target.files[0]);
      }
    }}
  />
</div>

      {/* ADD MEMBER */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter member name"
        />
        <button onClick={addMember} style={{ marginLeft: 10 }}>
          Add
        </button>
      </div>

      <button onClick={loadMembers} style={{ marginBottom: 10 }}>
        Refresh
      </button>

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li
  key={member.id}
  style={{
    marginBottom: 12,
    padding: 10,
    border: "1px solid #ccc",
  }}
>
  <div>
    {member.name} (ID: {member.id}){" "}
    {member.checked_in ? "(Checked In)" : "(Checked Out)"}
  </div>

  <div style={{ marginTop: 8 }}>
    <QRCodeCanvas value={String(member.id)} size={64} />
  </div>

  <button
    onClick={() => deleteMember(member.id)}
    style={{ marginLeft: 10 }}
  >
    Delete
  </button>

  <button
    onClick={() => toggleCheckIn(member.id)}
    style={{ marginLeft: 10 }}
  >
    Toggle
  </button>
</li>
          ))}
        </ul>
      )}
    </div>
  );
}