import React, { useState } from "react";
import { createPerson } from "../api/people";
import "./EmployeeForm.css";

const INITIAL_DEPARTMENTS = [
  "Engineering",
  "Product Management",
  "Design",
  "Sales",
  "Marketing",
  "Executive",
  "Human Resources",
  "Finance",
];

const POSITION_CHOICES = ["Volunteer", "Manager", "Asst. Director", "Director"];
const REPORTS_TO_CHOICES = ["Asst. Director", "Director", "Jenny"];
const ADD_NEW_DEPT_VALUE = "__ADD_NEW_DEPARTMENT__";

function EmployeeForm({ onAddEmployee }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [deptValue, setDeptValue] = useState("");
  const [showNewDeptInput, setShowNewDeptInput] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setMessage("");

    try {
      const fd = new FormData(form);

      const fullName = `${(fd.get("first_name") || "").trim()} ${(fd.get(
        "last_name"
      ) || "").trim()}`.trim();

      const payload = {
        name: fullName || fd.get("name") || "",
        title: fd.get("position") || fd.get("title") || "",
        department: fd.get("department") || "",
        status: fd.get("status") || "Employee",
        startDate: fd.get("startDate") || "",
        location: fd.get("location") || "",
        acdc_email: fd.get("acdc_email") || "",
        personal_email: fd.get("personal_email") || fd.get("email") || "",
        phone: fd.get("phone") || "",
        subteam: fd.get("subteam") || "",
        time_commitment: (() => {
          const v = parseInt(fd.get("time_commitment"), 10);
          return Number.isFinite(v) ? v : null;
        })(),
        // NEW: persist Reports To
        reports_to: fd.get("reports_to") || "",
      };

      const created = await createPerson(payload);

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
        // surface in the UI if needed
        reports_to: created.reports_to || "",
      };
      onAddEmployee(mapped);
      form.reset();
      setDeptValue("");
      setMessage("✅ Employee added successfully");
    } catch (err) {
      console.error("Error creating employee:", err);
      setMessage("❌ Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const onDepartmentChange = (e) => {
    const v = e.target.value;
    if (v === ADD_NEW_DEPT_VALUE) {
      setShowNewDeptInput(true);
      setNewDeptName("");
      return;
    }
    setDeptValue(v);
  };

  const confirmAddDept = () => {
    const name = (newDeptName || "").trim();
    if (!name) return;
    if (!departments.includes(name)) {
      setDepartments((prev) => [...prev, name]);
    }
    setDeptValue(name);
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  const cancelAddDept = () => {
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  return (
    <section className="add-employee-wrap" id="add-employee">
      <h1 className="add-employee-title">Add New Employee</h1>
      <p className="add-employee-subtitle">
        Register a new team member to the ACDC HR system
      </p>

      <form className="ae-form" onSubmit={handleSubmit}>
        <div className="ae-field">
          <label className="ae-label">First Name *</label>
          <input name="first_name" required placeholder="Enter first name" />
        </div>
        <div className="ae-field">
          <label className="ae-label">Last Name *</label>
          <input name="last_name" required placeholder="Enter last name" />
        </div>

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

        <div className="ae-field">
          <label className="ae-label">Employee ID *</label>
          <input name="subteam" required placeholder="e.g., EMP-1042" />
        </div>
        <div className="ae-field">
          <label className="ae-label">Start Date *</label>
          <input type="date" name="startDate" required />
        </div>

        <div className="ae-field">
          <label className="ae-label">Department *</label>
          <select
            name="department"
            required
            value={deptValue}
            onChange={onDepartmentChange}
          >
            <option value="" disabled>
              Select Department
            </option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            <option value={ADD_NEW_DEPT_VALUE}>➕ Add new department…</option>
          </select>

          {showNewDeptInput && (
            <div className="ae-inline">
              <input
                type="text"
                placeholder="Type department name"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
              />
              <button type="button" onClick={confirmAddDept}>
                Add
              </button>
              <button type="button" onClick={cancelAddDept}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="ae-field">
          <label className="ae-label">Position/Title *</label>
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

        {/* REPLACED "Role Level" WITH "Time Commitment" */}
        <div className="ae-field">
          <label className="ae-label">Time Commitment (hours/week) *</label>
          <input
            type="number"
            name="time_commitment"
            min="1"
            max="50"
            step="1"
            required
            placeholder="e.g., 10"
          />
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

        <div className="ae-field">
          <label className="ae-label">Reports To</label>
          <select name="reports_to" defaultValue="">
            <option value="" disabled>
              Select Reports To
            </option>
            {REPORTS_TO_CHOICES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="ae-field">
          <label className="ae-label">Annual Salary</label>
          <input name="salary" placeholder="Enter annual salary" />
        </div>

        <div className="ae-field ae-span-2">
          <label className="ae-label">ACDC Email</label>
          <input name="acdc_email" placeholder="user@acdc.com" />
        </div>

        <div className="ae-field ae-span-2">
          <label className="ae-label">Skills & Technologies</label>
          <input
            name="skills"
            placeholder="React, Python, Django, etc. (comma separated)"
          />
        </div>

        <div className="ae-field ae-span-2">
          <label className="ae-label">Bio/Description</label>
          <textarea
            name="bio"
            rows="4"
            placeholder="Brief description about the employee..."
          />
        </div>

        <input type="hidden" name="status" value="Employee" />

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
