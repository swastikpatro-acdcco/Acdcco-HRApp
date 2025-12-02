// import React, { useState } from "react";
// import { createPerson } from "../api/people";
// import "./EmployeeForm.css";

// // initial departments (will go into state)
// const INITIAL_DEPARTMENTS = [
//   "Engineering",
//   "Product Management",
//   "Design",
//   "Sales",
//   "Marketing",
//   "Executive",
//   "Human Resources",
//   "Finance",
// ];

// // Backend-allowed choices for position
// const POSITION_CHOICES = [
//   "Volunteer",
//   "Manager",
//   "Asst. Director",
//   "Director",
// ];

// // fixed list for Reports To
// const REPORTS_TO_CHOICES = ["Asst. Director", "Director", "Jenny"];

// // special value to detect "add new" choice
// const ADD_NEW_DEPT_VALUE = "__ADD_NEW_DEPARTMENT__";

// function EmployeeForm({ onAddEmployee }) {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // departments we show in the dropdown
//   const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
//   // which department is currently selected
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   // controls the inline "add new department" UI
//   const [showNewDeptInput, setShowNewDeptInput] = useState(false);
//   const [newDeptName, setNewDeptName] = useState("");

//   const handleDepartmentChange = (e) => {
//     const value = e.target.value;
//     // if user picked "Add new department..."
//     if (value === ADD_NEW_DEPT_VALUE) {
//       setShowNewDeptInput(true);
//       setNewDeptName("");
//       return;
//     }

//     // normal selection
//     setSelectedDepartment(value);
//     setShowNewDeptInput(false);
//     setNewDeptName("");
//   };

//   const handleAddNewDept = () => {
//     const trimmed = newDeptName.trim();
//     if (!trimmed) return;
//     setDepartments((prev) => {
//       if (prev.includes(trimmed)) return prev;
//       return [...prev, trimmed];
//     });
//     setSelectedDepartment(trimmed);
//     setShowNewDeptInput(false);
//     setNewDeptName("");
//   };

//   const handleCancelNewDept = () => {
//     setShowNewDeptInput(false);
//     setNewDeptName("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const form = e.currentTarget;
//     setLoading(true);
//     setMessage("");

//     try {
//       const fd = new FormData(form);

//       // Join first + last so your backend keeps receiving `name`
//       const fullName = `${(fd.get("first_name") || "").trim()} ${(fd.get(
//         "last_name"
//       ) || "").trim()}`.trim();

//       const payload = {
//         name: fullName || fd.get("name") || "",

//         // prefer the constrained `position` field; fall back to free-text `title`
//         title: fd.get("position") || fd.get("title") || "",

//         department: fd.get("department") || "",
//         status: fd.get("status") || "Employee",
//         startDate: fd.get("startDate") || "",
//         location: fd.get("location") || "",
//         acdc_email: fd.get("acdc_email") || "",
//         personal_email: fd.get("personal_email") || fd.get("email") || "",
//         phone: fd.get("phone") || "",
//         subteam: fd.get("subteam") || "",
//         reports_to: fd.get("reports_to") || "",
//         salary: fd.get("salary") || "",
//         skills: fd.get("skills") || "",
//         bio: fd.get("bio") || "",
//         // 👇 NEW: send time commitment to backend
//         time_commitment: fd.get("time_commitment") || "",
//       };

//       const created = await createPerson(payload);

//       const mapped = {
//         name: created.full_name,
//         title: created.position,
//         department: created.department,
//         status:
//           created.status === "on_leave"
//             ? "On leave"
//             : created.status === "active"
//             ? "Employee"
//             : "Inactive",
//         startDate: created.start_date,
//         location: created.timezone,
//         acdc_email: created.acdc_email,
//         personal_email: created.personal_email,
//         phone: created.phone,
//         reports_to: created.reports_to,
//         time_commitment: created.time_commitment,
//       };
//       onAddEmployee(mapped);
//       form.reset();
//       setSelectedDepartment("");
//       setShowNewDeptInput(false);
//       setNewDeptName("");
//       setMessage("✅ Employee added successfully");
//     } catch (err) {
//       console.error("Error creating employee:", err);
//       setMessage("❌ Failed to add employee");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="add-employee-wrap" id="add-employee">
//       <h1 className="add-employee-title">Add New Employee</h1>
//       <p className="add-employee-subtitle">
//         Register a new team member to the ACDC HR system
//       </p>

//       <form className="ae-form" onSubmit={handleSubmit}>
//         {/* Row 1 */}
//         <div className="ae-field">
//           <label className="ae-label">First Name *</label>
//           <input name="first_name" required placeholder="Enter first name" />
//         </div>
//         <div className="ae-field">
//           <label className="ae-label">Last Name *</label>
//           <input name="last_name" required placeholder="Enter last name" />
//         </div>

//         {/* Row 2 */}
//         <div className="ae-field">
//           <label className="ae-label">Email Address *</label>
//           <input
//             name="personal_email"
//             type="email"
//             required
//             placeholder="name@example.com"
//           />
//         </div>
//         <div className="ae-field">
//           <label className="ae-label">Phone Number</label>
//           <input name="phone" placeholder="(555) 555-5555" />
//         </div>

//         {/* Row 3 */}
//         <div className="ae-field">
//           <label className="ae-label">Employee ID *</label>
//           <input name="subteam" required placeholder="e.g., EMP-1042" />
//         </div>
//         <div className="ae-field">
//           <label className="ae-label">Start Date *</label>
//           <input type="date" name="startDate" required />
//         </div>

//         {/* Row 4 */}
//         <div className="ae-field">
//           <label className="ae-label">Department *</label>
//           <select
//             name="department"
//             required
//             value={selectedDepartment}
//             onChange={handleDepartmentChange}
//           >
//             <option value="" disabled>
//               Select Department
//             </option>
//             {departments.map((d) => (
//               <option key={d} value={d}>
//                 {d}
//               </option>
//             ))}
//             <option value={ADD_NEW_DEPT_VALUE}>+ Add new department...</option>
//           </select>

//           {showNewDeptInput && (
//             <div
//               style={{
//                 marginTop: "6px",
//                 display: "flex",
//                 gap: "6px",
//               }}
//             >
//               <input
//                 type="text"
//                 value={newDeptName}
//                 onChange={(e) => setNewDeptName(e.target.value)}
//                 placeholder="New department name"
//                 className="ae-input"
//                 style={{ flex: 1, padding: "6px 10px" }}
//               />
//               <button
//                 type="button"
//                 onClick={handleAddNewDept}
//                 className="ae-submit"
//                 style={{ padding: "6px 10px" }}
//               >
//                 Add
//               </button>
//               <button
//                 type="button"
//                 onClick={handleCancelNewDept}
//                 style={{
//                   padding: "6px 10px",
//                   background: "#eee",
//                   borderRadius: "8px",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="ae-field">
//           <label className="ae-label">Position/Title *</label>
//           <select name="position" required defaultValue="">
//             <option value="" disabled>
//               Select Position / Title
//             </option>
//             {POSITION_CHOICES.map((p) => (
//               <option key={p} value={p}>
//                 {p}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Row 5 (was Role Level) */}
//         <div className="ae-field">
//           <label className="ae-label">Time Commitment (hours/week) *</label>
//           <input
//             name="time_commitment"
//             type="number"
//             min="1"
//             max="50"
//             required
//             placeholder="e.g., 10"
//           />
//         </div>

//         <div className="ae-field">
//           <label className="ae-label">Work Location *</label>
//           <select name="location" defaultValue="" required>
//             <option value="" disabled>
//               Select Location
//             </option>
//             <option value="EST">EST (US East)</option>
//             <option value="CST">CST (US Central)</option>
//             <option value="MST">MST (US Mountain)</option>
//             <option value="PST">PST (US Pacific)</option>
//             <option value="UTC">UTC</option>
//           </select>
//         </div>

//         {/* Row 6 */}
//         <div className="ae-field">
//           <label className="ae-label">Reports To</label>
//           <select name="reports_to" defaultValue="">
//             <option value="" disabled>
//               Select a manager
//             </option>
//             {REPORTS_TO_CHOICES.map((mgr) => (
//               <option key={mgr} value={mgr}>
//                 {mgr}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="ae-field">
//           <label className="ae-label">Annual Salary</label>
//           <input name="salary" placeholder="Enter annual salary" />
//         </div>

//         {/* Row 7 */}
//         <div className="ae-field ae-span-2">
//           <label className="ae-label">ACDC Email</label>
//           <input name="acdc_email" placeholder="user@acdc.com" />
//         </div>

//         {/* Row 8 */}
//         <div className="ae-field ae-span-2">
//           <label className="ae-label">Skills & Technologies</label>
//           <input
//             name="skills"
//             placeholder="React, Python, Django, etc. (comma separated)"
//           />
//         </div>

//         {/* Row 9 */}
//         <div className="ae-field ae-span-2">
//           <label className="ae-label">Bio/Description</label>
//           <textarea
//             name="bio"
//             rows="4"
//             placeholder="Brief description about the employee..."
//           />
//         </div>

//         <input type="hidden" name="status" value="Employee" />

//         <div className="ae-actions ae-span-2">
//           <button type="submit" className="ae-submit" disabled={loading}>
//             <span className="ae-submit-icon">👤</span>
//             {loading ? "Adding..." : "Add Employee"}
//           </button>
//         </div>
//       </form>

//       {message && <p className="ae-msg">{message}</p>}
//     </section>
//   );
// }

// export default EmployeeForm;

// src/components/EmployeeForm.js
import React, { useState } from "react";
import { createPerson } from "../api/people";
import { useAuthStore } from "../store/auth";
import "./EmployeeForm.css";

// initial departments (will go into state)
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

// Backend-allowed choices for position
const POSITION_CHOICES = ["Volunteer", "Manager", "Asst. Director", "Director"];

// fixed list for Reports To
const REPORTS_TO_CHOICES = ["Asst. Director", "Director", "Jenny"];

// special value to detect "add new" choice
const ADD_NEW_DEPT_VALUE = "__ADD_NEW_DEPARTMENT__";

function EmployeeForm({ onAddEmployee }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // departments we show in the dropdown
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  // which department is currently selected
  const [selectedDepartment, setSelectedDepartment] = useState("");
  // controls the inline "add new department" UI
  const [showNewDeptInput, setShowNewDeptInput] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  // read token from Zustand
  const token = useAuthStore((s) => s.token);

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    if (value === ADD_NEW_DEPT_VALUE) {
      setShowNewDeptInput(true);
      setNewDeptName("");
      return;
    }
    setSelectedDepartment(value);
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  const handleAddNewDept = () => {
    const trimmed = newDeptName.trim();
    if (!trimmed) return;
    setDepartments((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
    setSelectedDepartment(trimmed);
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  const handleCancelNewDept = () => {
    setShowNewDeptInput(false);
    setNewDeptName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // auth gate for Add Employee (per assignment)
    if (!token) {
      alert(
        "Please sign in to add an employee (token missing). Ask backend for a JWT, or in dev run: window.__setToken('dummy-hr-token-123')."
      );
      return;
    }

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
        // prefer the constrained `position` field; fall back to free-text `title`
        title: fd.get("position") || fd.get("title") || "",
        department: fd.get("department") || "",
        status: fd.get("status") || "Employee",
        startDate: fd.get("startDate") || "",
        location: fd.get("location") || "",
        acdc_email: fd.get("acdc_email") || "",
        personal_email: fd.get("personal_email") || fd.get("email") || "",
        phone: fd.get("phone") || "",
        subteam: fd.get("subteam") || "",
        reports_to: fd.get("reports_to") || "",
        salary: fd.get("salary") || "",
        skills: fd.get("skills") || "",
        bio: fd.get("bio") || "",
        time_commitment: fd.get("time_commitment") || "",
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
        reports_to: created.reports_to,
        time_commitment: created.time_commitment,
      };

      onAddEmployee(mapped);
      form.reset();
      setSelectedDepartment("");
      setShowNewDeptInput(false);
      setNewDeptName("");
      setMessage("✅ Employee added successfully");
    } catch (err) {
      console.error("Error creating employee:", err);
      if (err?.response?.status === 401) {
        setMessage("❌ Unauthorized (401). Please sign in again.");
      } else {
        setMessage("❌ Failed to add employee");
      }
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
          <select
            name="department"
            required
            value={selectedDepartment}
            onChange={handleDepartmentChange}
          >
            <option value="" disabled>
              Select Department
            </option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
            <option value={ADD_NEW_DEPT_VALUE}>+ Add new department...</option>
          </select>

          {showNewDeptInput && (
            <div
              style={{
                marginTop: "6px",
                display: "flex",
                gap: "6px",
              }}
            >
              <input
                type="text"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="New department name"
                className="ae-input"
                style={{ flex: 1, padding: "6px 10px" }}
              />
              <button
                type="button"
                onClick={handleAddNewDept}
                className="ae-submit"
                style={{ padding: "6px 10px" }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={handleCancelNewDept}
                style={{
                  padding: "6px 10px",
                  background: "#eee",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
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

        {/* Row 5 */}
        <div className="ae-field">
          <label className="ae-label">Time Commitment (hours/week) *</label>
          <input
            name="time_commitment"
            type="number"
            min="1"
            max="50"
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

        {/* Row 6 */}
        <div className="ae-field">
          <label className="ae-label">Reports To</label>
          <select name="reports_to" defaultValue="">
            <option value="" disabled>
              Select a manager
            </option>
            {REPORTS_TO_CHOICES.map((mgr) => (
              <option key={mgr} value={mgr}>
                {mgr}
              </option>
            ))}
          </select>
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

