import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import { transformToBackendFormat, validateEmployeeForm } from '../utils/dataTransform';

const EmployeeForm = ({ onAddEmployee }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    startDate: '',
    department: '',
    position: '',
    role: '',
    location: '',
    reportsTo: '',
    salary: '',
    skills: '',
    bio: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Set default start date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, startDate: today }));
  }, []);

  const generateEmployeeId = () => {
    const { firstName, lastName, department } = formData;
    
    if (firstName && lastName && department) {
      const deptCode = {
        'Engineering': 'ENG',
        'Product Management': 'PM',
        'Design': 'DES',
        'Sales': 'SAL',
        'Marketing': 'MKT',
        'Executive': 'EXE',
        'Human Resources': 'HR',
        'Finance': 'FIN'
      };
      
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const empId = `${deptCode[department] || 'GEN'}${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}${randomNum}`;
      setFormData(prev => ({ ...prev, employeeId: empId }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate Employee ID when relevant fields change
    if (['firstName', 'lastName', 'department'].includes(name)) {
      setTimeout(generateEmployeeId, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({});
    setSubmitError('');
    
    // Validate form data
    const validation = validateEmployeeForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Transform data to backend format
      const backendData = transformToBackendFormat(formData);
      
      // Submit to backend API
      const response = await employeeAPI.createEmployee(backendData);
      
      // Transform response for frontend display
      const newEmployee = {
        id: response.id,
        name: response.full_name,
        location: formData.location,
        title: response.position || formData.position,
        status: response.status === 'active' ? 'Employee' : response.status,
        startDate: response.start_date,
        department: response.department,
        reportsTo: formData.reportsTo || ''
      };
      
      // Call parent callback to update the employee list
      onAddEmployee(newEmployee);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        startDate: new Date().toISOString().split('T')[0],
        department: '',
        position: '',
        role: '',
        location: '',
        reportsTo: '',
        salary: '',
        skills: '',
        bio: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error creating employee:', error);
      setSubmitError(error.message || 'Failed to create employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="add-employee" className="section employee-form">
      <div className="container">
        <h2 className="section-title">Add New Employee</h2>
        <p className="section-subtitle">Register a new team member to the ACDC HR system</p>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">First Name *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required 
                />
                {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Last Name *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  className={`form-input ${formErrors.lastName ? 'error' : ''}`}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required 
                />
                {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  className="form-input" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="employeeId" className="form-label">Employee ID *</label>
                <input 
                  type="text" 
                  id="employeeId" 
                  name="employeeId" 
                  className="form-input" 
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">Start Date *</label>
                <input 
                  type="date" 
                  id="startDate" 
                  name="startDate" 
                  className="form-input" 
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="department" className="form-label">Department *</label>
                <select 
                  id="department" 
                  name="department" 
                  className={`form-select ${formErrors.department ? 'error' : ''}`}
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Executive">Executive</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
                {formErrors.department && <span className="error-message">{formErrors.department}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="position" className="form-label">Position/Title *</label>
                <input 
                  type="text" 
                  id="position" 
                  name="position" 
                  className={`form-input ${formErrors.position ? 'error' : ''}`}
                  value={formData.position}
                  onChange={handleInputChange}
                  required 
                />
                {formErrors.position && <span className="error-message">{formErrors.position}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="role" className="form-label">Role Level *</label>
                <select 
                  id="role" 
                  name="role" 
                  className={`form-select ${formErrors.role ? 'error' : ''}`}
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Director">Director</option>
                  <option value="Admin">Admin</option>
                </select>
                {formErrors.role && <span className="error-message">{formErrors.role}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="location" className="form-label">Work Location *</label>
                <select 
                  id="location" 
                  name="location" 
                  className={`form-select ${formErrors.location ? 'error' : ''}`}
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Location</option>
                  <option value="New York City">New York City</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="Remote">Remote</option>
                  <option value="Boston">Boston</option>
                  <option value="Chicago">Chicago</option>
                  <option value="Austin">Austin</option>
                </select>
                {formErrors.location && <span className="error-message">{formErrors.location}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="reportsTo" className="form-label">Reports To</label>
                <input 
                  type="text" 
                  id="reportsTo" 
                  name="reportsTo" 
                  className="form-input" 
                  placeholder="Manager/Supervisor Name"
                  value={formData.reportsTo}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="salary" className="form-label">Annual Salary</label>
                <input 
                  type="number" 
                  id="salary" 
                  name="salary" 
                  className="form-input" 
                  placeholder="Enter annual salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="skills" className="form-label">Skills & Technologies</label>
                <input 
                  type="text" 
                  id="skills" 
                  name="skills" 
                  className="form-input" 
                  placeholder="React, Python, Django, etc. (comma separated)"
                  value={formData.skills}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group full-width">
                <label htmlFor="bio" className="form-label">Bio/Description</label>
                <textarea 
                  id="bio" 
                  name="bio" 
                  className="form-textarea" 
                  placeholder="Brief description about the employee..."
                  value={formData.bio}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="form-submit"
              disabled={isSubmitting}
            >
              <i className="fas fa-user-plus"></i>
              {isSubmitting ? 'Adding Employee...' : 'Add Employee'}
            </button>
            
            {submitError && (
              <div className="error-message-general">
                <i className="fas fa-exclamation-circle"></i>
                {submitError}
              </div>
            )}
            
            <div className={`success-message ${showSuccess ? 'show' : ''}`}>
              <i className="fas fa-check-circle"></i>
              Employee has been successfully added to the system!
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EmployeeForm;
