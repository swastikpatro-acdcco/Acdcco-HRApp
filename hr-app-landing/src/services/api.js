import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Django backend URL
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Employee API functions
export const employeeAPI = {
  // Get all employees
  getAllEmployees: async () => {
    try {
      const response = await api.get('/employees/');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch employee: ${error.message}`);
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employees/', employeeData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await api.patch(`/employees/${id}/`, employeeData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  },

  // Delete employee
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  },

  // Filter employees by department
  getEmployeesByDepartment: async (department) => {
    try {
      const response = await api.get(`/employees/filter_employees/?department=${department}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to filter employees: ${error.message}`);
    }
  },

  // Filter employees by status
  getEmployeesByStatus: async (status) => {
    try {
      const response = await api.get(`/employees/filter_employees/?status=${status}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to filter employees: ${error.message}`);
    }
  },

  // Update employee by email or name
  updateEmployeeByIdentifier: async (identifier, data, type = 'email') => {
    try {
      const param = type === 'email' ? 'email' : 'full_name';
      const response = await api.patch(`/employees/update_by_identifier/?${param}=${encodeURIComponent(identifier)}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }
  },

  // Delete employee by email or name
  deleteEmployeeByIdentifier: async (identifier, type = 'email') => {
    try {
      const param = type === 'email' ? 'email' : 'full_name';
      const response = await api.delete(`/employees/delete_by_identifier/?${param}=${encodeURIComponent(identifier)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  },
};

export default api;


