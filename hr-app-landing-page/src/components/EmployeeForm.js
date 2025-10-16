import React, { useState } from "react";
import { createPerson } from "../api/people";
import "./EmployeeForm.css";
 
const DEPARTMENTS = [
  "Engineering",
  "Product Management",
  "Design",
  "Sales",
  "Marketing",
  "Executive",
  "Human Resources",
  "Finance",
];
 
// Backend-allowed choices for position
const POSITION_CHOICES = ["Volunteer", "Director", "Admin"];
 
function EmployeeForm({ onAddEmployee }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setMessage("");
 
    try {
      const fd = new FormData(form);
 
      // Join first + last so your backend keeps receiving `name`
      const fullName = `${(fd.get("first_name") || "").trim()} ${(fd.get(
        "last_name"
      ) || "").trim()}`.trim();
 
      const payload = {
        name: fullName || fd.get("name") || "",
 
        // IMPORTANT: prefer the constrained `position` field; fall back to free-text `title`
        title: fd.get("position") || fd.get("title") || "",
 
        department: fd.get("department") || "",
        status: fd.get("status") || "Employee", // hidden default
        startDate: fd.get("startDate") || "",
        location: fd.get("location") || "", // timezone / location
        acdc_email: fd.get("acdc_email") || "",
        personal_email: fd.get("personal_email") || fd.get("email") || "",
        phone: fd.get("phone") || "",
        subteam: fd.get("subteam") || "", // optional, kept for compatibility
      };
 
      const created = await createPerson(payload);
 
      // Map back to your directory card shape
      const mapped = {
        name: created.full_name,
        title: created.position,
        department: created.department,
        status:
          created.status === "on_leave"
            ? "On leave"
            : created.status === "active"
            ? "Employee"
            : "Inactive",
        startDate: created.start_date,
        location: created.timezone,
        acdc_email: created.acdc_email,
        personal_email: created.personal_email,
        phone: created.phone,
      };
      onAddEmployee(mapped);
      form.reset();
      setMessage("✅ Employee added successfully");
    } catch (err) {
      console.error("Error creating employee:", err);
      setMessage("❌ Failed to add employee");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <section className="add-employee-wrap" id="add-employee">
      <h1 className="add-employee-title">Add New Employee</h1>
      <p className="add-employee-subtitle">
        Register a new team member to the ACDC HR system
      </p>
 
      <form className="ae-form" onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className="ae-field">
          <label className="ae-label">First Name *</label>
          <input name="first_name" required placeholder="Enter first name" />
        </div>
        <div className="ae-field">
          <label className="ae-label">Last Name *</label>
          <input name="last_name" required placeholder="Enter last name" />
        </div>
 
        {/* Row 2 */}
        <div className="ae-field">
          <label className="ae-label">Email Address *</label>
          <input
            name="personal_email"
            type="email"
            required
            placeholder="name@example.com"
          />
        </div>
        <div className="ae-field">
          <label className="ae-label">Phone Number</label>
          <input name="phone" placeholder="(555) 555-5555" />
        </div>
 
        {/* Row 3 */}
        <div className="ae-field">
          <label className="ae-label">Employee ID *</label>
          <input name="subteam" required placeholder="e.g., EMP-1042" />
        </div>
        <div className="ae-field">
          <label className="ae-label">Start Date *</label>
          <input type="date" name="startDate" required />
        </div>
 
        {/* Row 4 */}
        <div className="ae-field">
          <label className="ae-label">Department *</label>
          <select name="department" required defaultValue="">
            <option value="" disabled>
              Select Department
            </option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="ae-field">
          <label className="ae-label">Position/Title *</label>
          {/* Constrained select to match backend choices */}
          <select name="position" required defaultValue="">
            <option value="" disabled>
              Select Position / Title
            </option>
            {POSITION_CHOICES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
 
        {/* Row 5 */}
        <div className="ae-field">
          <label className="ae-label">Role Level *</label>
          <select defaultValue="">
            <option value="" disabled>
              Select Role
            </option>
            <option>Intern</option>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
            <option>Lead</option>
          </select>
        </div>
        <div className="ae-field">
          <label className="ae-label">Work Location *</label>
          <select name="location" defaultValue="" required>
            <option value="" disabled>
              Select Location
            </option>
            <option value="EST">EST (US East)</option>
            <option value="CST">CST (US Central)</option>
            <option value="MST">MST (US Mountain)</option>
            <option value="PST">PST (US Pacific)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
 
        {/* Row 6 */}
        <div className="ae-field">
          <label className="ae-label">Reports To</label>
          <input name="reports_to" placeholder="Manager/Supervisor Name" />
        </div>
        <div className="ae-field">
          <label className="ae-label">Annual Salary</label>
          <input name="salary" placeholder="Enter annual salary" />
        </div>
 
        {/* Row 7 */}
        <div className="ae-field ae-span-2">
          <label className="ae-label">ACDC Email</label>
          <input name="acdc_email" placeholder="user@acdc.com" />
        </div>
 
        {/* Row 8 */}
        <div className="ae-field ae-span-2">
          <label className="ae-label">Skills & Technologies</label>
          <input
            name="skills"
            placeholder="React, Python, Django, etc. (comma separated)"
          />
        </div>
 
        {/* Row 9 */}
        <div className="ae-field ae-span-2">
          <label className="ae-label">Bio/Description</label>
          <textarea
            name="bio"
            rows="4"
            placeholder="Brief description about the employee..."
          />
        </div>
 
        {/* Hidden default to keep your backend status mapping */}
        <input type="hidden" name="status" value="Employee" />
 
        {/* Submit */}
        <div className="ae-actions ae-span-2">
          <button type="submit" className="ae-submit" disabled={loading}>
            <span className="ae-submit-icon">👤</span>
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </div>
      </form>
 
      {message && <p className="ae-msg">{message}</p>}
    </section>
  );
}
 
export default EmployeeForm;