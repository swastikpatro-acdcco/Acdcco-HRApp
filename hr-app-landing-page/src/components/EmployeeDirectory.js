import React from 'react';

const EmployeeDirectory = ({ employees }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section id="employees" className="section employee-directory">
      <div className="container">
        <h2 className="section-title">Employee Directory</h2>
        <p className="section-subtitle">Current team members and their information</p>
        
        <div className="employees-grid">
          {employees.map((employee, index) => {
            const statusClass = employee.status === 'Employee' ? 'status-employee' : 'status-leave';
            const locationClass = employee.location === 'New York City' ? 'nyc' : '';
            
            return (
              <div key={index} className="employee-card">
                <div className="employee-avatar">{getInitials(employee.name)}</div>
                <div className="employee-name">{employee.name}</div>
                <div className="employee-title">{employee.title}</div>
                <div className="employee-details">
                  <div className="employee-detail">
                    <span className="detail-label">Location:</span>
                    <span className={`location-badge ${locationClass}`}>{employee.location}</span>
                  </div>
                  <div className="employee-detail">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${statusClass}`}>{employee.status}</span>
                  </div>
                  <div className="employee-detail">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(employee.startDate)}</span>
                  </div>
                  <div className="employee-detail">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{employee.department}</span>
                  </div>
                  {employee.reportsTo && (
                    <div className="employee-detail">
                      <span className="detail-label">Reports To:</span>
                      <span className="detail-value">{employee.reportsTo}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EmployeeDirectory;
