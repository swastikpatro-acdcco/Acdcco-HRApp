import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import EmployeeDirectory from './components/EmployeeDirectory';
import EmployeeForm from './components/EmployeeForm';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { employeeAPI } from './services/api';
import { transformForDirectory } from './utils/dataTransform';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load employees from backend on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setError('');
        const backendEmployees = await employeeAPI.getAllEmployees();
        const transformedEmployees = backendEmployees.map(transformForDirectory);
        setEmployees(transformedEmployees);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please check your connection and try again.');
        // Fallback to sample data if API fails
        setEmployees([
          {id: 1, name: 'Brooke Khan', location: 'New York City', title: 'VP of Sales', status: 'On leave', startDate: '2015-01-13', department: 'Sales', reportsTo: 'Pat Everett'},
          {id: 2, name: 'Sandy Hagen', location: 'New York City', title: 'Product Designer', status: 'Employee', startDate: '2018-02-01', department: 'Design', reportsTo: 'Jamie Ziya'},
          {id: 3, name: 'Jamie Ziya', location: 'New York City', title: 'VP of Product', status: 'Employee', startDate: '2013-05-30', department: 'Product Management', reportsTo: 'Pat Everett'},
          {id: 4, name: 'Pat Everett', location: 'New York City', title: 'CEO', status: 'Employee', startDate: '2014-08-24', department: 'Executive', reportsTo: ''},
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const addEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  return (
    <div className="App">
      <Navigation />
      <Hero />
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading employees...</p>
          </div>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <small>Using sample data for demonstration.</small>
          </div>
          <EmployeeDirectory employees={employees} />
        </div>
      ) : (
        <EmployeeDirectory employees={employees} />
      )}
      <EmployeeForm onAddEmployee={addEmployee} />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
