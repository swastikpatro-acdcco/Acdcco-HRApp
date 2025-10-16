import React, { useState } from 'react';

const Dashboard = ({ employees, onUpdateEmployee, onDeleteEmployee }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (employee) => {
    setEditingId(employee.name);
    setEditForm({ ...employee });
  };

  const handleSave = () => {
    onUpdateEmployee(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = (employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      onDeleteEmployee(employeeName);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="section">
          <h2 className="section-title">Employee Dashboard</h2>
          <p className="section-subtitle">Manage and edit employee information</p>
          
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Reports To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={index} className={editingId === employee.name ? 'editing' : ''}>
                    <td>
                      {editingId === employee.name ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        <div className="employee-cell">
                          <div className="employee-avatar-small">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{employee.name}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === employee.name ? (
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        employee.title
                      )}
                    </td>
                    <td>
                      {editingId === employee.name ? (
                        <select
                          value={editForm.department || ''}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="table-select"
                        >
                          <option value="Sales">Sales</option>
                          <option value="Design">Design</option>
                          <option value="Product Management">Product Management</option>
                          <option value="Executive">Executive</option>
                          <option value="Product Marketing">Product Marketing</option>
                          <option value="Engineering">Engineering</option>
                        </select>
                      ) : (
                        <span className="department-badge">{employee.department}</span>
                      )}
                    </td>
                    <td>
                      {editingId === employee.name ? (
                        <input
                          type="text"
                          value={editForm.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        <span className="location-badge">{employee.location}</span>
                      )}
                    </td>
                    <td>
                      {editingId === employee.name ? (
                        <select
                          value={editForm.status || ''}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="table-select"
                        >
                          <option value="Employee">Employee</option>
                          <option value="On leave">On leave</option>
                        </select>
                      ) : (
                        <span className={`status-badge status-${employee.status.toLowerCase().replace(' ', '-')}`}>
                          {employee.status}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === employee.name ? (
                        <input
                          type="date"
                          value={editForm.startDate || ''}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        new Date(employee.startDate).toLocaleDateString()
                      )}
                    </td>
                    <td>
                      {editingId === employee.name ? (
                        <input
                          type="text"
                          value={editForm.reportsTo || ''}
                          onChange={(e) => handleInputChange('reportsTo', e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        employee.reportsTo || 'N/A'
                      )}
                    </td>
                    <td>
                      {editingId === employee.name ? (
                        <div className="action-buttons">
                          <button 
                            onClick={handleSave}
                            className="btn-save"
                            title="Save changes"
                          >
                            ✓
                          </button>
                          <button 
                            onClick={handleCancel}
                            className="btn-cancel"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEdit(employee)}
                            className="btn-edit"
                            title="Edit employee"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(employee.name)}
                            className="btn-delete"
                            title="Delete employee"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
