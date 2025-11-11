import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import client from "./api/client";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import EmployeeDirectory from "./components/EmployeeDirectory";
import EmployeeForm from "./components/EmployeeForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

   const updateEmployee = (oldName, updatedEmployee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.name === oldName ? updatedEmployee : emp))
    );
  };

   const deleteEmployee = (employeeName) => {
    setEmployees((prev) => prev.filter((emp) => emp.name !== employeeName));
  };

  // ✅ Fetch backend data only if logged in
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchEmployees = async () => {
      try {
        const res = await client.get("/people/");
        const data = res.data?.results ?? res.data;
        const normalized = (Array.isArray(data) ? data : data?.results || []).map((p) => ({
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
          acdc_email: p.acdc_email || "",
          personal_email: p.personal_email || "",
          phone: p.phone || "",
        }));
        setEmployees(normalized);
      } catch (err) {
        console.error("Error loading employees:", err);
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isAuthenticated]);

  const DashboardContent = () => {
    if (loading) return <p>Loading employees...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
      <>
        <Navigation />
        <Hero />
        <EmployeeDirectory employees={employees} />
        <EmployeeForm onAddEmployee={(newEmp) => setEmployees([...employees, newEmp])} />
        <Contact />
        <Footer />
      </>
    );
  };

  return (
    <div className="App">
      <Routes>
        {/* Login page */}
        <Route
          path="/"
          element={
            <LoginPage
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                navigate("/dashboard");
              }}
            />
          }
        />

        {/* Home / Landing page */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardContent />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Employee management dashboard */}
        <Route
          path="/employee-dashboard"
          element={
            isAuthenticated ? (
              <>
                <Navigation />
                <Dashboard
                  employees={employees}
                  onUpdateEmployee={updateEmployee}
                  onDeleteEmployee={deleteEmployee}
                />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
