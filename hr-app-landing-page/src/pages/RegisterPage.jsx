import React, { useEffect, useState } from "react";
import { fetchHRPeople, setPortalAccount } from "../api/people";

function RegisterRow({ person, onSave, saving }) {
  const [portalEmail, setPortalEmail] = useState(person.portal_email || "");
  const [portalRole, setPortalRole] = useState(person.portal_role || "");
  const [portalPassword, setPortalPassword] = useState(
    person.portal_password || ""
  );

  return (
    <tr>
      <td>{person.full_name}</td>
      <td>{person.department}</td>
      <td>
        <input
          value={portalEmail}
          onChange={(e) => setPortalEmail(e.target.value)}
          placeholder="login email"
        />
      </td>
      <td>
        <input
          value={portalRole}
          onChange={(e) => setPortalRole(e.target.value)}
          placeholder="e.g. HR, HR-Assistant"
        />
      </td>
      <td>
        <input
          value={portalPassword}
          onChange={(e) => setPortalPassword(e.target.value)}
          placeholder="set password"
          type="password"
        />
      </td>
      <td>
        <button
          onClick={() =>
            onSave(person.id, {
              portal_email: portalEmail,
              portal_role: portalRole,
              portal_password: portalPassword,
            })
          }
          disabled={saving}
        >
          {saving ? "Assigning..." : "Assign"}
        </button>
      </td>
    </tr>
  );
}

export default function RegisterPage() {
  const [people, setPeople] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchHRPeople();
        setPeople(data);
      } catch (err) {
        console.error("Failed to load HR people", err);
      }
    })();
  }, []);

  const handleSave = async (id, formData) => {
    setSavingId(id);
    setMessage("");
    try {
      const updated = await setPortalAccount(id, formData);
      setPeople((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setMessage("✅ Saved");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div
      style={{
        padding: "120px 1.5rem 2.5rem", // 👈 pushes content below fixed navbar
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem" }}>Register HR Users</h1>
        <p style={{ marginBottom: "1rem", color: "#555" }}>
          Only employees in <strong>Human Resources</strong> are shown here.
        </p>
        {message && <p>{message}</p>}

        {people.length === 0 ? (
          <p>No HR employees found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="register-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Portal Email</th>
                  <th>Portal Role</th>
                  <th>Portal Password</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <RegisterRow
                    key={person.id}
                    person={person}
                    saving={savingId === person.id}
                    onSave={handleSave}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .register-table {
          width: 100%;
          border-collapse: collapse;
        }
        .register-table th,
        .register-table td {
          text-align: left;
          padding: 0.6rem;
          border-bottom: 1px solid #eee;
        }
        .register-table input {
          width: 100%;
          padding: 0.35rem 0.4rem;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        .register-table button {
          background: #6d4aff;
          color: #fff;
          border: none;
          padding: 0.4rem 0.7rem;
          border-radius: 6px;
          cursor: pointer;
        }
        .register-table button[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
