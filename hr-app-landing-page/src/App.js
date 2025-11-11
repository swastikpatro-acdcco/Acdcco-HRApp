import React, { useState, useEffect } from "react";
import client from "./api/client";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import EmployeeDirectory from "./components/EmployeeDirectory";
import EmployeeForm from "./components/EmployeeForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import RegisterPage from "./pages/RegisterPage"; // 👈 NEW
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees from backend
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await client.get("/people/"); // calls http://localhost:8000/api/people/
        const data = res.data?.results ?? res.data;

        if (isMounted) {
          const normalized = (Array.isArray(data) ? data : data?.results || []).map(
            (p) => ({
              id: p.id,
              name: p.full_name || "", // map full_name → name
              title: p.position || "",
              department: p.department || "",
              status:
                p.status === "on_leave"
                  ? "On leave"
                  : p.status === "active"
                  ? "Employee"
                  : p.status || "Inactive",
              startDate: p.start_date || "",
              location: p.timezone || "", // using timezone as location substitute
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

    return () => {
      isMounted = false;
    };
  }, []);

  const addEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (oldName, updatedEmployee) => {
    setEmployees(
      employees.map((emp) => (emp.name === oldName ? updatedEmployee : emp))
    );
  };

  const deleteEmployee = (employeeName) => {
    setEmployees(employees.filter((emp) => emp.name !== employeeName));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (loading) return <p>Loading employees...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    // 👇 NEW PAGE
    if (currentPage === "register") {
      return <RegisterPage />;
    }

    if (currentPage === "dashboard") {
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
      {/* make sure Navigation can call onPageChange("register") */}
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      {renderPage()}
    </div>
  );
}

export default App;
