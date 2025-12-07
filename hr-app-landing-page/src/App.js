import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import client from './api/client';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import EmployeeDirectory from './components/EmployeeDirectory';
import EmployeeForm from './components/EmployeeForm';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/LoginPage';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout); // Zustand logout
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch employees from backend only if logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    const fetchEmployees = async () => {
      try {
        const res = await client.get('/employees/');
        const data = res.data?.results ?? res.data;

        if (isMounted) {
        const normalized = (Array.isArray(data) ? data : data?.results || []).map((p) => ({
          id: p.id,
          name: p.full_name || "",
          title: p.position || "",
          department: p.department || "",
          status: p.status === "on_leave" ? "On leave"
                : p.status === "active" ? "Employee"
                : p.status || "Inactive",
          startDate: p.start_date || "",
          location: p.timezone || "",
          reportsTo: p.reports_to || "",
          acdc_email: p.acdc_email || "",
          personal_email: p.personal_email || "",
          phone: p.phone || "",
        }));
      setEmployees(normalized);
     }
   } catch (e) {
        console.error("Error loading employees:", e);
        if (isMounted) setError("Failed to load employees");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployees();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const addEmployee = (newEmployee) => {
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const updateEmployee = (oldName, updatedEmployee) => {
     setEmployees(employees.map(emp => 
      emp.name === oldName ? updatedEmployee : emp
    ));
  };

  const deleteEmployee = (employeeName) => {
    setEmployees(employees.filter(emp => emp.name !== employeeName));
  };

  //  Dashboard + Home Content
  const renderPage = () => {
    if (loading) return <p>Loading employees...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
      <>
        <Navigation isAuthenticated={isAuthenticated} logout={logout} />
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
      <Routes>
        {/* Login Page */}
        <Route
          path="/"
          element={
            <LoginPage/>
          }
        />

        {/* Home / Landing Page */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              renderPage()
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Employee Management Dashboard */}
        <Route
          path="/employee-dashboard"
          element={
            isAuthenticated ? (
              <>
                <Navigation
                  isAuthenticated={isAuthenticated}
                  logout={logout} 
                />
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
