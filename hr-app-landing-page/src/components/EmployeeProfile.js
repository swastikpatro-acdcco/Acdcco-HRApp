import React from 'react';

const EmployeeProfile = ({ employee, onBack }) => {
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Employee' || status === 'active') return 'status-badge-active';
    if (status === 'On leave' || status === 'on_leave') return 'status-badge-leave';
    return 'status-badge-inactive';
  };

  if (!employee) {
    return (
      <div className="employee-profile-container">
        <div className="employee-profile-content">
          <p>Employee not found</p>
          <button onClick={onBack} className="btn-back">← Back to Directory</button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-profile-container">
      <div className="employee-profile-content">
        {/* Header with Back Button */}
        <div className="profile-header">
          <button onClick={onBack} className="btn-back">
            <i className="fas fa-arrow-left"></i> Back to Directory
          </button>
        </div>

        {/* Main Profile Section */}
        <div className="profile-main">
          {/* Left Side - Information */}
          <div className="profile-info">
            <div className="profile-name-section">
              <h1 className="profile-name">{employee.name || 'N/A'}</h1>
              <h2 className="profile-title">{employee.title || 'No Title'}</h2>
              <div className="profile-department">
                <i className="fas fa-building"></i>
                <span>{employee.department || 'N/A'}</span>
              </div>
            </div>

            {/* Professional Summary Section */}
            <div className="profile-section">
              <h3 className="section-title">
                <i className="fas fa-user-circle"></i> Professional Summary
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-calendar-alt"></i> Start Date
                  </span>
                  <span className="info-value">{formatDate(employee.startDate)}</span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-map-marker-alt"></i> Location
                  </span>
                  <span className="info-value">{employee.location || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <i className="fas fa-info-circle"></i> Status
                  </span>
                  <span className={`status-badge ${getStatusBadgeClass(employee.status)}`}>
                    {employee.status || 'N/A'}
                  </span>
                </div>

                {employee.reportsTo && (
                  <div className="info-item">
                    <span className="info-label">
                      <i className="fas fa-user-tie"></i> Reports To
                    </span>
                    <span className="info-value">{employee.reportsTo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="profile-section">
              <h3 className="section-title">
                <i className="fas fa-address-book"></i> Contact Information
              </h3>
              <div className="info-grid">
                {employee.acdc_email && (
                  <div className="info-item">
                    <span className="info-label">
                      <i className="fas fa-envelope"></i> ACDC Email
                    </span>
                    <span className="info-value">
                      <a href={`mailto:${employee.acdc_email}`}>{employee.acdc_email}</a>
                    </span>
                  </div>
                )}

                {employee.personal_email && (
                  <div className="info-item">
                    <span className="info-label">
                      <i className="fas fa-envelope-open"></i> Personal Email
                    </span>
                    <span className="info-value">
                      <a href={`mailto:${employee.personal_email}`}>{employee.personal_email}</a>
                    </span>
                  </div>
                )}

                {employee.phone && (
                  <div className="info-item">
                    <span className="info-label">
                      <i className="fas fa-phone"></i> Phone
                    </span>
                    <span className="info-value">
                      <a href={`tel:${employee.phone}`}>{employee.phone}</a>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Photo Section */}
          <div className="profile-photo-section">
            <div className="photo-container">
              <div className="photo-placeholder">
                {employee.photo ? (
                  <img src={employee.photo} alt={employee.name} className="employee-photo" />
                ) : (
                  <div className="photo-initials">
                    {getInitials(employee.name)}
                  </div>
                )}
              </div>
              <div className="photo-upload-hint">
                <i className="fas fa-camera"></i>
                <span>Photo placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;

