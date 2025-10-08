// Utility functions to transform data between frontend and backend formats

/**
 * Transform frontend employee form data to backend API format
 */
export const transformToBackendFormat = (formData) => {
  return {
    full_name: `${formData.firstName} ${formData.lastName}`.trim(),
    acdc_email: formData.email,
    personal_email: null, // Can be added later if needed
    phone: formData.phone || null,
    department: formData.department,
    subteam: null, // Can be added later if needed
    position: formData.role || null,
    status: 'active', // Default status for new employees
    timezone: formData.location === 'Remote' ? 'UTC' : null,
    time_commitment: null, // Can be calculated or added later
    start_date: formData.startDate,
    end_date: null, // Not applicable for new employees
  };
};

/**
 * Transform backend employee data to frontend format
 */
export const transformToFrontendFormat = (backendData) => {
  const nameParts = backendData.full_name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: backendData.id,
    firstName: firstName,
    lastName: lastName,
    email: backendData.acdc_email || '',
    phone: backendData.phone || '',
    employeeId: backendData.id, // Using Django ID as employee ID
    startDate: backendData.start_date,
    department: backendData.department,
    position: backendData.position || '',
    role: backendData.position || '',
    location: backendData.timezone === 'UTC' ? 'Remote' : 'New York City', // Default mapping
    reportsTo: '', // Not in backend model yet
    salary: '', // Not in backend model yet
    skills: '', // Not in backend model yet
    bio: '', // Not in backend model yet
    status: backendData.status === 'active' ? 'Employee' : backendData.status,
    // Additional backend fields
    personalEmail: backendData.personal_email,
    subteam: backendData.subteam,
    timeCommitment: backendData.time_commitment,
    endDate: backendData.end_date,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
  };
};

/**
 * Transform backend employee data for directory display
 */
export const transformForDirectory = (backendData) => {
  return {
    id: backendData.id,
    name: backendData.full_name,
    title: backendData.position || 'Employee',
    location: backendData.timezone === 'UTC' ? 'Remote' : 'New York City',
    status: backendData.status === 'active' ? 'Employee' : backendData.status,
    startDate: backendData.start_date,
    department: backendData.department,
    reportsTo: '', // Not available in backend yet
    email: backendData.acdc_email,
    phone: backendData.phone,
  };
};

/**
 * Validate employee form data before submission
 */
export const validateEmployeeForm = (formData) => {
  const errors = {};

  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!formData.department) {
    errors.department = 'Department is required';
  }

  if (!formData.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!formData.position?.trim()) {
    errors.position = 'Position is required';
  }

  if (!formData.role) {
    errors.role = 'Role level is required';
  }

  if (!formData.location) {
    errors.location = 'Work location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};


