import React, { useState, useEffect } from "react";
import client from "./api/client";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import EmployeeDirectory from "./components/EmployeeDirectory";
import EmployeeForm from "./components/EmployeeForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import RegisterPage from "./pages/RegisterPage";
import { useAuthStore } from "./store/auth";
import "./App.css";

/** Small inline sign-in shown only when user opens Register without a token */
function InlineRegisterGate() {
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const devLogin = () => {
    // TODO: replace with real auth call when backend sends a JWT
    setToken("dummy-hr-token-123");
    setMsg("✅ Access granted. You can now assign portal accounts.");
  };

  return (
    <div style={{ padding: "120px 16px" }}>
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Verify Access</h2>
        <p style={{ marginTop: 0, color: "#666" }}>
          Sign in to manage HR registrations.
        </p>
        {msg && <p style={{ color: "green" }}>{msg}</p>}

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@acdc.com"
          style={{
            width: "100%",
            margin: "6px 0 12px",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        />

        <button
          onClick={devLogin}
          style={{
            width: "100%",
            background: "#6d4aff",
            color: "#fff",
            border: 0,
            padding: "10px 12px",
            borderRadius: 8,
          }}
        >
          Continue
        </button>

        <p style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
          (Dev mode: sets a temporary token. Will be replaced by real RBAC token.)
        </p>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useAuthStore((s) => s.token);

  // Fetch employees
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await client.get("/people/");
        const data = res.data?.results ?? res.data;

        if (isMounted) {
          const normalized = (Array.isArray(data) ? data : data?.results || []).map(
            (p) => ({
              id: p.id,
              name: p.full_name || "",
              title: p.position || "",
              department: p.department || "",
              status:
                p.status === "on_leave"
                  ? "On leave"
                  : p.status === "active"
                  ? "Employee"
                  : p.status || "Inactive",
              startDate: p.start_date || "",
              location: p.timezone || "",
              reportsTo: "",
              acdc_email: p.acdc_email || "",
              personal_email: p.personal_email || "",
              phone: p.phone || "",
            })
          );
          setEmployees(normalized);
          console.log("Loaded employees:", normalized);
        }
      } catch (e) {
        console.error("Error loading employees:", e);
        if (isMounted) setError("Failed to load employees");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const addEmployee = (newEmployee) => setEmployees((prev) => [...prev, newEmployee]);
  const updateEmployee = (oldName, updated) =>
    setEmployees((prev) => prev.map((emp) => (emp.name === oldName ? updated : emp)));
  const deleteEmployee = (name) =>
    setEmployees((prev) => prev.filter((emp) => emp.name !== name));

  const handlePageChange = (page) => setCurrentPage(page);

  const renderPage = () => {
    if (loading) return <p>Loading employees...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    // ✅ Register now includes its own access check
    if (currentPage === "register") {
      return token ? <RegisterPage /> : <InlineRegisterGate />;
    }

    if (currentPage === "dashboard") {
      // If you want Dashboard protected too, uncomment next line:
      // return token ? (<Dashboard .../>) : <InlineRegisterGate />;
      return (
        <Dashboard
          employees={employees}
          onUpdateEmployee={updateEmployee}
          onDeleteEmployee={deleteEmployee}
        />
      );
    }

    // default = landing stack
    return (
      <>
        <Hero />
        <EmployeeDirectory employees={employees} />
        <EmployeeForm onAddEmployee={addEmployee} />
        <Contact />
        <Footer />
      </>
    );
  };

  return (
    <div className="App">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      {renderPage()}
    </div>
  );
}

export default App;
