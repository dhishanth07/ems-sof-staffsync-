import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowDownUp,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  Pencil,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
  Users,
  X,
} from "lucide-react";

const emptyEmployee = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  dateOfJoining: new Date().toISOString().slice(0, 10),
  status: "Active",
};

const departments = ["Engineering", "Design", "Marketing", "Human Resources", "Finance", "Operations", "Sales"];

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Something went wrong. Please try again.");
  }
  return response.status === 204 ? null : response.json();
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatSalary(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function EmployeeModal({ employee, onClose, onSave, saving }) {
  const [form, setForm] = useState(employee || emptyEmployee);
  const [formError, setFormError] = useState("");

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setFormError("");
    try {
      await onSave({ ...form, salary: Number(form.salary) });
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{employee ? "TEAM MEMBER" : "NEW TEAM MEMBER"}</span>
            <h2 id="modal-title">{employee ? "Edit employee" : "Add employee"}</h2>
            <p>Enter the employee details below.</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
        </div>
        <form className="employee-form" onSubmit={submit}>
          <label className="field full-field">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={update} placeholder="e.g. Alex Morgan" required maxLength={100} />
          </label>
          <label className="field">
            <span>Email address</span>
            <input name="email" type="email" value={form.email} onChange={update} placeholder="alex@company.com" required />
          </label>
          <label className="field">
            <span>Phone number</span>
            <input name="phone" type="tel" value={form.phone} onChange={update} placeholder="+1 (555) 000-0000" required />
          </label>
          <label className="field">
            <span>Department</span>
            <select name="department" value={form.department} onChange={update} required>
              <option value="" disabled>Select department</option>
              {departments.map((department) => <option key={department}>{department}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Job title</span>
            <input name="designation" value={form.designation} onChange={update} placeholder="e.g. Product Designer" required />
          </label>
          <label className="field">
            <span>Annual salary (USD)</span>
            <input name="salary" type="number" min="0" step="100" value={form.salary} onChange={update} placeholder="85000" required />
          </label>
          <label className="field">
            <span>Start date</span>
            <input name="dateOfJoining" type="date" value={form.dateOfJoining?.slice(0, 10) || ""} onChange={update} required />
          </label>
          <label className="field full-field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={update}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          {formError && <p className="form-error full-field" role="alert">{formError}</p>}
          <div className="form-actions full-field">
            <button type="button" className="button button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving..." : employee ? "Save changes" : "Add employee"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function LeaveRequestModal({ employeeEmail, employeeName, onClose, onSave, saving }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    leaveType: "Annual Leave",
    startDate: today,
    endDate: today,
    reason: "",
  });
  const [formError, setFormError] = useState("");

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setFormError("");
    if (form.endDate < form.startDate) {
      setFormError("End date cannot be before start date.");
      return;
    }
    try {
      await onSave({
        ...form,
        employeeEmail,
        employeeName,
      });
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal leave-modal" aria-labelledby="leave-modal-title" role="dialog" aria-modal="true">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">TIME OFF</span>
            <h2 id="leave-modal-title">Request leave</h2>
            <p>Submit a request for admin approval.</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button>
        </div>
        <form className="employee-form" onSubmit={submit}>
          <label className="field full-field">
            <span>Leave type</span>
            <select name="leaveType" value={form.leaveType} onChange={update}>
              <option>Annual Leave</option>
              <option>Sick Leave</option>
              <option>Personal Leave</option>
              <option>Unpaid Leave</option>
            </select>
          </label>
          <label className="field">
            <span>Start date</span>
            <input name="startDate" type="date" min={today} value={form.startDate} onChange={update} required />
          </label>
          <label className="field">
            <span>End date</span>
            <input name="endDate" type="date" min={form.startDate} value={form.endDate} onChange={update} required />
          </label>
          <label className="field full-field">
            <span>Reason</span>
            <textarea name="reason" value={form.reason} onChange={update} placeholder="Briefly explain your leave request..." required maxLength={500} />
          </label>
          {formError && <p className="form-error full-field" role="alert">{formError}</p>}
          <div className="form-actions full-field">
            <button type="button" className="button button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>{saving ? "Submitting..." : "Submit request"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EmployeeDashboard({ adminEmail, loginRole, onLogout, theme, onThemeChange }) {
  const isAdmin = loginRole === "admin";
  const [activeView, setActiveView] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All employees");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [sortNewest, setSortNewest] = useState(true);
  const [modalEmployee, setModalEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [leaveError, setLeaveError] = useState("");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("All requests");

  async function loadEmployees() {
    setLoading(true);
    setLoadError("");
    try {
      setEmployees(await request("/employees"));
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadLeaveRequests() {
    setLeaveLoading(true);
    setLeaveError("");
    try {
      const path = isAdmin ? "/leave-requests" : `/leave-requests?employeeEmail=${encodeURIComponent(adminEmail)}`;
      setLeaveRequests(await request(path));
    } catch (error) {
      setLeaveError(error.message);
    } finally {
      setLeaveLoading(false);
    }
  }

  useEffect(() => {
    loadLeaveRequests();
  }, [adminEmail, isAdmin]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredEmployees = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return employees
      .filter((employee) => statusFilter === "All employees" || employee.status === statusFilter)
      .filter((employee) => departmentFilter === "All departments" || employee.department === departmentFilter)
      .filter((employee) => !needle || [employee.name, employee.email, employee.department, employee.designation]
        .some((value) => value?.toLowerCase().includes(needle)))
      .sort((a, b) => sortNewest
        ? new Date(b.createdAt || b.dateOfJoining) - new Date(a.createdAt || a.dateOfJoining)
        : a.name.localeCompare(b.name));
  }, [departmentFilter, employees, query, sortNewest, statusFilter]);

  const departmentSummaries = useMemo(() => {
    const groups = new Map();
    employees.forEach((employee) => {
      const name = employee.department || "Unassigned";
      if (!groups.has(name)) {
        groups.set(name, { name, employees: [], activeCount: 0, totalSalary: 0 });
      }

      const group = groups.get(name);
      group.employees.push(employee);
      group.totalSalary += Number(employee.salary || 0);
      if (employee.status === "Active") group.activeCount += 1;
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        averageSalary: group.employees.length ? group.totalSalary / group.employees.length : 0,
      }))
      .sort((a, b) => b.employees.length - a.employees.length || a.name.localeCompare(b.name));
  }, [employees]);

  const recentEmployees = useMemo(
    () => [...employees]
      .sort((a, b) => new Date(b.createdAt || b.dateOfJoining) - new Date(a.createdAt || a.dateOfJoining))
      .slice(0, 5),
    [employees],
  );

  const activeCount = employees.filter((employee) => employee.status === "Active").length;
  const departmentCount = departmentSummaries.length;
  const averageSalary = employees.length
    ? employees.reduce((total, employee) => total + Number(employee.salary || 0), 0) / employees.length
    : 0;
  const pageHeading = {
    overview: {
      eyebrow: "TEAM OVERVIEW",
      title: "Your team, at a glance.",
      description: "See who is on your team and how your organization is growing.",
    },
    employees: {
      eyebrow: "PEOPLE DIRECTORY",
      title: "Your people, at a glance.",
      description: "Manage your team and keep all your employee information in one place.",
    },
    departments: {
      eyebrow: "ORGANIZATION",
      title: "Every team, in one place.",
      description: "Explore departments, team sizes, and the people in each group.",
    },
    about: {
      eyebrow: "ABOUT STAFFSYNC",
      title: "People management, made simple.",
      description: "A quick guide to what you can do in your workspace.",
    },
    settings: {
      eyebrow: "WORKSPACE SETTINGS",
      title: "Settings",
      description: "View your account and workspace information.",
    },
    leaves: {
      eyebrow: "TIME OFF",
      title: isAdmin ? "Leave requests" : "My leave requests",
      description: isAdmin ? "Review employee requests and keep the team schedule up to date." : "Submit leave requests and track their approval status.",
    },
  }[activeView];

  function openCreate() {
    setModalEmployee(null);
    setModalOpen(true);
  }

  function openEdit(employee) {
    setModalEmployee(employee);
    setModalOpen(true);
  }

  function showDepartmentEmployees(department) {
    setDepartmentFilter(department);
    setQuery("");
    setActiveView("employees");
  }

  async function saveEmployee(form) {
    setSaving(true);
    try {
      if (modalEmployee) {
        const updated = await request(`/employees/${modalEmployee._id}`, { method: "PUT", body: JSON.stringify(form) });
        setEmployees((current) => current.map((item) => item._id === updated._id ? updated : item));
        setToast("Employee details updated.");
      } else {
        const created = await request("/employees", { method: "POST", body: JSON.stringify(form) });
        setEmployees((current) => [created, ...current]);
        setToast("Employee added to your team.");
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function submitLeaveRequest(form) {
    setLeaveSaving(true);
    try {
      const created = await request("/leave-requests", {
        method: "POST",
        headers: { "x-user-role": "user" },
        body: JSON.stringify(form),
      });
      setLeaveRequests((current) => [created, ...current]);
      setLeaveModalOpen(false);
      setToast("Leave request submitted.");
    } finally {
      setLeaveSaving(false);
    }
  }

  async function updateLeaveStatus(leaveRequest, status) {
    try {
      const updated = await request(`/leave-requests/${leaveRequest._id}/status`, {
        method: "PATCH",
        headers: { "x-user-role": "admin" },
        body: JSON.stringify({ status }),
      });
      setLeaveRequests((current) => current.map((item) => item._id === updated._id ? updated : item));
      setToast(`Leave request ${status.toLowerCase()}.`);
    } catch (error) {
      setToast(error.message);
    }
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Remove ${employee.name} from your team? This cannot be undone.`)) return;
    try {
      await request(`/employees/${employee._id}`, { method: "DELETE" });
      setEmployees((current) => current.filter((item) => item._id !== employee._id));
      setToast(`${employee.name} was removed.`);
    } catch (error) {
      setToast(error.message);
    }
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="StaffSync home">
          <span className="brand-mark"><Users size={20} strokeWidth={2.5} /></span>
          <span>staff<span className="brand-light">sync</span></span>
        </a>
        <div className="workspace-switch">
          <div className="workspace-avatar"><img src="/ferrari-logo.png" alt="Ferrari logo" /></div>
          <div className="workspace-copy"><strong>Ferrari Org</strong><span>Workspace</span></div>
          <ChevronDown size={16} />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav className="main-nav" aria-label="Main navigation">
          <button type="button" className={`nav-link ${activeView === "overview" ? "selected" : ""}`} aria-current={activeView === "overview" ? "page" : undefined} onClick={() => setActiveView("overview")}><LayoutDashboard size={18} /> Overview</button>
          <button type="button" className={`nav-link ${activeView === "employees" ? "selected" : ""}`} aria-current={activeView === "employees" ? "page" : undefined} onClick={() => setActiveView("employees")}><Users size={18} /> Employees <span className="nav-count">{employees.length}</span></button>
          <button type="button" className={`nav-link ${activeView === "leaves" ? "selected" : ""}`} aria-current={activeView === "leaves" ? "page" : undefined} onClick={() => setActiveView("leaves")}><CalendarDays size={18} /> Leave requests <span className="nav-count">{leaveRequests.filter((item) => item.status === "Pending").length}</span></button>
          <button type="button" className={`nav-link ${activeView === "departments" ? "selected" : ""}`} aria-current={activeView === "departments" ? "page" : undefined} onClick={() => setActiveView("departments")}><BriefcaseBusiness size={18} /> Departments <span className="nav-count">{departmentCount}</span></button>
          <button type="button" className={`nav-link ${activeView === "about" ? "selected" : ""}`} aria-current={activeView === "about" ? "page" : undefined} onClick={() => setActiveView("about")}><CircleHelp size={18} /> About us</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon"><CircleHelp size={17} /></span>
            <strong>Need a hand?</strong>
            <p>Visit our help center to learn more.</p>
            <a href="mailto:support@example.com">Get support <span>↗</span></a>
          </div>
          <button
            className={`nav-link bottom-link ${activeView === "settings" ? "selected" : ""}`}
            type="button"
            aria-current={activeView === "settings" ? "page" : undefined}
            onClick={() => setActiveView("settings")}
          >
            <Settings size={18} /> Settings
          </button>
          <div className="profile">
            <div className="profile-avatar">{initials(adminEmail)}</div>
            <div className="profile-copy"><strong>{adminEmail}</strong><span>{isAdmin ? "Admin" : "User"}</span></div>
            <button className="icon-button profile-menu" type="button" aria-label="Sign out" title="Sign out" onClick={onLogout}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeView[0].toUpperCase() + activeView.slice(1)}</strong></div>
          <div className="topbar-right">
            <span className="today-label">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date())}</span>
            <div className="profile-avatar top-avatar">{initials(adminEmail)}</div>
          </div>
        </header>

        <div className="page-wrap">
          <section className="page-heading">
            <div>
              <div className="eyebrow">{pageHeading.eyebrow}</div>
              <h1>{pageHeading.title}</h1>
              <p>{pageHeading.description}</p>
            </div>
            {isAdmin && activeView === "employees" && <button className="button button-primary add-button" onClick={openCreate}><Plus size={18} strokeWidth={2.5} /> Add employee</button>}
            {!isAdmin && activeView === "leaves" && <button className="button button-primary add-button" onClick={() => setLeaveModalOpen(true)}><Plus size={18} strokeWidth={2.5} /> Request leave</button>}
          </section>

          {!["about", "settings", "leaves"].includes(activeView) && <section className="stats-grid" aria-label="Employee statistics">
            <article className="stat-card">
              <div className="stat-top"><span>Total employees</span><span className="stat-icon violet"><Users size={18} /></span></div>
              <div className="stat-value">{employees.length}<span className="stat-caption">people</span></div>
              <div className="stat-foot"><span className="dot violet-dot" /> In your workspace</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Active employees</span><span className="stat-icon green"><span className="status-pulse" /></span></div>
              <div className="stat-value">{activeCount}<span className="stat-caption">people</span></div>
              <div className="stat-foot"><span className="dot green-dot" /> Currently on the team</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Departments</span><span className="stat-icon orange"><BriefcaseBusiness size={17} /></span></div>
              <div className="stat-value">{departmentCount}<span className="stat-caption">{departmentCount === 1 ? "department" : "departments"}</span></div>
              <div className="stat-foot"><span className="dot orange-dot" /> Across your organization</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Average salary</span><span className="stat-icon orange"><ArrowDownUp size={17} /></span></div>
              <div className="stat-value salary-value">{formatSalary(averageSalary)}</div>
              <div className="stat-foot"><span className="dot orange-dot" /> Annual compensation</div>
            </article>
          </section>}

          {activeView === "overview" && (
            <section className="overview-grid">
              <article className="directory-panel overview-panel">
                <div className="directory-heading">
                  <div>
                    <h2>Recently added <span className="total-pill">{recentEmployees.length}</span></h2>
                    <p>Your newest team members.</p>
                  </div>
                  <button className="text-button" type="button" onClick={() => setActiveView("employees")}>View directory <ArrowRight size={14} /></button>
                </div>
                {recentEmployees.length ? (
                  <div className="overview-employee-list">
                    {recentEmployees.map((employee, index) => (
                      <div className="overview-employee" key={employee._id}>
                        <div className={`employee-avatar avatar-${index % 5}`}>{initials(employee.name)}</div>
                        <div className="employee-info"><strong>{employee.name}</strong><span>{employee.email}</span></div>
                        <div className="overview-employee-role"><strong>{employee.designation}</strong><span>{employee.department}</span></div>
                        <span className={`status-badge ${employee.status === "Active" ? "active" : "inactive"}`}><span />{employee.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overview-empty">
                    <span>No employees added yet.</span>
                    {isAdmin && <button className="text-button" type="button" onClick={openCreate}>Add your first employee <ArrowRight size={14} /></button>}
                  </div>
                )}
              </article>

              <article className="directory-panel overview-panel">
                <div className="directory-heading">
                  <div>
                    <h2>Departments <span className="total-pill">{departmentCount}</span></h2>
                    <p>Team size across your organization.</p>
                  </div>
                  <button className="text-button" type="button" onClick={() => setActiveView("departments")}>View all <ArrowRight size={14} /></button>
                </div>
                {departmentSummaries.length ? (
                  <div className="overview-department-list">
                    {departmentSummaries.slice(0, 5).map((department, index) => (
                      <button className="overview-department" key={department.name} type="button" onClick={() => showDepartmentEmployees(department.name)}>
                        <span className={`department-icon department-icon-${index % 4}`}><BriefcaseBusiness size={15} /></span>
                        <span className="overview-department-name">{department.name}</span>
                        <span className="overview-department-count">{department.employees.length} {department.employees.length === 1 ? "person" : "people"}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="overview-empty">Departments will appear here when you add employees.</div>
                )}
              </article>
            </section>
          )}

          {activeView === "departments" && (
            <section className="department-grid" aria-label="Departments">
              {departmentSummaries.length ? departmentSummaries.map((department, index) => (
                <article className="department-card" key={department.name}>
                  <div className="department-card-heading">
                    <span className={`department-icon department-icon-${index % 4}`}><BriefcaseBusiness size={18} /></span>
                    <div><h2>{department.name}</h2><p>{department.employees.length} {department.employees.length === 1 ? "team member" : "team members"}</p></div>
                  </div>
                  <div className="department-metrics">
                    <div><span>Active members</span><strong>{department.activeCount}</strong></div>
                    <div><span>Average salary</span><strong>{formatSalary(department.averageSalary)}</strong></div>
                  </div>
                  <div className="department-members">
                    {department.employees.slice(0, 3).map((employee, memberIndex) => (
                      <div className="department-member" key={employee._id}>
                        <span className={`employee-avatar avatar-${(index + memberIndex) % 5}`}>{initials(employee.name)}</span>
                        <span><strong>{employee.name}</strong><small>{employee.designation}</small></span>
                      </div>
                    ))}
                    {department.employees.length > 3 && <span className="department-more">+{department.employees.length - 3} more</span>}
                  </div>
                  <button className="department-view-button" type="button" onClick={() => showDepartmentEmployees(department.name)}>
                    View employees <ArrowRight size={14} />
                  </button>
                </article>
              )) : (
                <div className="department-empty">
                  <span className="department-empty-icon"><BriefcaseBusiness size={20} /></span>
                  <h2>No departments yet</h2>
                  <p>Add employees and assign departments to see teams here.</p>
                  {isAdmin && <button className="button button-primary" type="button" onClick={openCreate}><Plus size={16} /> Add employee</button>}
                </div>
              )}
            </section>
          )}

          {activeView === "about" && (
            <section className="directory-panel about-panel" aria-label="About StaffSync">
              <div className="directory-heading">
                <div>
                  <p>Your simple workspace for keeping employee information organized.</p>
                </div>
              </div>
              <div className="about-content">
                <p>Use StaffSync to keep your team directory up to date, explore departments, and get a quick overview of your organization.</p>
                <ul>
                  <li><strong>Admins</strong> can add, update, and remove employee records.</li>
                  <li><strong>Users</strong> can browse the employee directory and departments.</li>
                </ul>
              </div>
            </section>
          )}

          {activeView === "settings" && (
            <section className="settings-grid" aria-label="Settings">
              <article className="settings-card">
                <div className="settings-card-heading">
                  <span className="settings-icon"><Users size={17} /></span>
                  <div><h2>Account</h2><p>Your current sign-in details</p></div>
                </div>
                <dl className="settings-details">
                  <div><dt>Email</dt><dd>{adminEmail}</dd></div>
                  <div><dt>Role</dt><dd>{isAdmin ? "Admin" : "User"}</dd></div>
                </dl>
              </article>
              <article className="settings-card">
                <div className="settings-card-heading">
                  <span className="settings-icon"><Sun size={17} /></span>
                  <div><h2>Appearance</h2><p>Choose your preferred theme</p></div>
                </div>
                <div className="theme-picker" role="radiogroup" aria-label="Theme">
                  <button
                    className={`theme-option ${theme === "light" ? "selected" : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={theme === "light"}
                    onClick={() => onThemeChange("light")}
                  >
                    <Sun size={16} /> Light
                  </button>
                  <button
                    className={`theme-option ${theme === "dark" ? "selected" : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={theme === "dark"}
                    onClick={() => onThemeChange("dark")}
                  >
                    <Moon size={16} /> Dark
                  </button>
                </div>
              </article>
            </section>
          )}

          {activeView === "leaves" && (
            <section className="directory-panel leave-panel" aria-label="Leave requests">
              <div className="directory-heading leave-heading">
                <div>
                  <h2>{isAdmin ? "Employee requests" : "My requests"} <span className="total-pill">{leaveRequests.length}</span></h2>
                  <p>{isAdmin ? "Approve or reject pending time-off requests." : "View the status of your submitted leave."}</p>
                </div>
                <select
                  className="filter-select"
                  aria-label="Filter leave requests"
                  value={leaveStatusFilter}
                  onChange={(event) => setLeaveStatusFilter(event.target.value)}
                >
                  <option>All requests</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
              {leaveError && <div className="error-banner" role="alert">{leaveError} <button onClick={loadLeaveRequests}>Try again</button></div>}
              <div className="table-scroll">
                <table className="leave-table">
                  <thead>
                    <tr>
                      {isAdmin && <th>EMPLOYEE</th>}
                      <th>TYPE</th>
                      <th>DATES</th>
                      <th>REASON</th>
                      <th>STATUS</th>
                      {isAdmin && <th><span className="sr-only">Actions</span></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {leaveLoading ? (
                      <tr><td className="table-message" colSpan={isAdmin ? 6 : 4}>Loading leave requests...</td></tr>
                    ) : leaveRequests.filter((item) => leaveStatusFilter === "All requests" || item.status === leaveStatusFilter).length ? (
                      leaveRequests
                        .filter((item) => leaveStatusFilter === "All requests" || item.status === leaveStatusFilter)
                        .map((leaveRequest) => (
                          <tr key={leaveRequest._id}>
                            {isAdmin && (
                              <td>
                                <div className="employee-info">
                                  <strong>{leaveRequest.employeeName}</strong>
                                  <span>{leaveRequest.employeeEmail}</span>
                                </div>
                              </td>
                            )}
                            <td><strong className="leave-type">{leaveRequest.leaveType}</strong></td>
                            <td className="date-cell">{formatDate(leaveRequest.startDate)} - {formatDate(leaveRequest.endDate)}</td>
                            <td><span className="leave-reason">{leaveRequest.reason}</span></td>
                            <td><span className={`status-badge leave-status ${leaveRequest.status.toLowerCase()}`}><span />{leaveRequest.status}</span></td>
                            {isAdmin && (
                              <td>
                                {leaveRequest.status === "Pending" ? (
                                  <div className="leave-actions">
                                    <button type="button" className="leave-action approve" onClick={() => updateLeaveStatus(leaveRequest, "Approved")}>Approve</button>
                                    <button type="button" className="leave-action reject" onClick={() => updateLeaveStatus(leaveRequest, "Rejected")}>Reject</button>
                                  </div>
                                ) : <span className="leave-reviewed">Reviewed</span>}
                              </td>
                            )}
                          </tr>
                        ))
                    ) : (
                      <tr><td className="table-message" colSpan={isAdmin ? 6 : 4}>{leaveRequests.length ? "No requests match this filter." : "No leave requests yet."}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === "employees" && <section className="directory-panel" id="employees">
            <div className="directory-heading">
              <div>
                <h2>All employees <span className="total-pill">{employees.length}</span></h2>
                <p>A directory of everyone in your workspace.</p>
              </div>
              <button className="button button-secondary export-button" onClick={() => setToast("Export is not available in this starter.")}><LogOut size={15} /> Export</button>
            </div>
            <div className="toolbar">
              <label className="search-box">
                <Search size={17} />
                <input aria-label="Search employees" placeholder="Search by name, role, department..." value={query} onChange={(event) => setQuery(event.target.value)} />
                <kbd>⌘ K</kbd>
              </label>
              <div className="toolbar-actions">
                <select className="filter-select" aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option>All employees</option><option>Active</option><option>Inactive</option>
                </select>
                <select className="filter-select" aria-label="Filter by department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                  <option>All departments</option>
                  {departmentSummaries.map((department) => <option key={department.name}>{department.name}</option>)}
                </select>
                <button className="button button-secondary sort-button" onClick={() => setSortNewest((current) => !current)}><ArrowDownUp size={15} /> {sortNewest ? "Newest" : "Name"}</button>
              </div>
            </div>
            {loadError && <div className="error-banner" role="alert">{loadError} <button onClick={loadEmployees}>Try again</button></div>}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>JOB TITLE</th><th>START DATE</th><th>STATUS</th><th>SALARY</th>{isAdmin && <th><span className="sr-only">Actions</span></th>}</tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="table-message" colSpan={isAdmin ? 7 : 6}>Loading your team...</td></tr>
                  ) : filteredEmployees.length ? filteredEmployees.map((employee, index) => (
                    <tr key={employee._id}>
                      <td><div className="employee-cell"><div className={`employee-avatar avatar-${index % 5}`}>{initials(employee.name)}</div><div className="employee-info"><strong>{employee.name}</strong><span><Mail size={12} /> {employee.email}</span></div></div></td>
                      <td><span className="department-label"><span className="department-dot" />{employee.department}</span></td>
                      <td className="role-cell">{employee.designation}</td>
                      <td className="date-cell">{formatDate(employee.dateOfJoining)}</td>
                      <td><span className={`status-badge ${employee.status === "Active" ? "active" : "inactive"}`}><span />{employee.status}</span></td>
                      <td className="salary-cell">{formatSalary(employee.salary)}</td>
                      {isAdmin && <td><div className="row-actions"><button className="icon-button" aria-label={`Edit ${employee.name}`} onClick={() => openEdit(employee)}><Pencil size={15} /></button><button className="icon-button delete-action" aria-label={`Delete ${employee.name}`} onClick={() => deleteEmployee(employee)}><Trash2 size={15} /></button></div></td>}
                    </tr>
                  )) : (
                    <tr><td className="table-message" colSpan={isAdmin ? 7 : 6}>{employees.length ? "No employees match your search." : "No employees yet."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="table-footer">
              <span>Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees</span>
              <span className="footer-note"><span className="footer-dot" /> All changes saved</span>
            </footer>
          </section>}
        </div>
      </main>
      {modalOpen && <EmployeeModal key={modalEmployee?._id || "new"} employee={modalEmployee} onClose={() => setModalOpen(false)} onSave={saveEmployee} saving={saving} />}
      {leaveModalOpen && (
        <LeaveRequestModal
          employeeEmail={adminEmail}
          employeeName={employees.find((employee) => employee.email?.toLowerCase() === adminEmail.toLowerCase())?.name || adminEmail}
          onClose={() => setLeaveModalOpen(false)}
          onSave={submitLeaveRequest}
          saving={leaveSaving}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function AdminLogin({ onLogin, theme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("admin");
  const [loginError, setLoginError] = useState("");
  const [checkingUser, setCheckingUser] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoginError("");

    if (loginRole === "admin" && (email.trim().toLowerCase() !== "admin@gmail.com" || password !== "admin123")) {
      setLoginError("Invalid email id or password. Try again!");
      return;
    }

    if (loginRole === "user") {
      setCheckingUser(true);
      try {
        const employees = await request("/employees");
        const userExists = employees.some((employee) => employee.email?.trim().toLowerCase() === email.trim().toLowerCase());
        if (!userExists) {
          setLoginError("Invalid email id or password. Try again!");
          return;
        }
      } catch (error) {
        setLoginError(error.message);
        return;
      } finally {
        setCheckingUser(false);
      }
    }

    onLogin(email.trim(), loginRole);
  }

  return (
    <main className="login-page" data-theme={theme}>
      <section className="login-card">
        <a className="brand login-brand" href="#" aria-label="StaffSync home">
          <span className="brand-mark"><Users size={20} strokeWidth={2.5} /></span>
          <span>staff<span className="brand-light">sync</span></span>
        </a>
        <div className="login-heading">
          <span className="login-icon"><LockKeyhole size={21} /></span>
          <span className="eyebrow">EMPLOYEE WORKSPACE</span>
          <h1>Welcome back</h1>
          <p>{loginRole === "admin" ? "Enter your admin credentials to continue." : "Use the email address saved in the employee directory."}</p>
        </div>
        <div className="login-role-picker" role="radiogroup" aria-label="Login type">
          <button
            type="button"
            role="radio"
            aria-checked={loginRole === "admin"}
            className={loginRole === "admin" ? "login-role active" : "login-role"}
            onClick={() => { setLoginRole("admin"); setEmail(""); setPassword(""); setLoginError(""); }}
          >
            <span className="login-role-icon"><LockKeyhole size={16} /></span>
            <span><strong>Admin Login</strong><small>Manage employees</small></span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={loginRole === "user"}
            className={loginRole === "user" ? "login-role active" : "login-role"}
            onClick={() => { setLoginRole("user"); setEmail(""); setPassword(""); setLoginError(""); }}
          >
            <span className="login-role-icon"><Users size={16} /></span>
            <span><strong>User Login</strong><small>View employee directory</small></span>
          </button>
        </div>
        <form className="login-form" onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input autoComplete="username" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setLoginError(""); }} placeholder="Enter your email address" required autoFocus />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete="current-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setLoginError(""); }} placeholder="Enter your password" required />
          </label>
          {loginError && <p className="login-error" role="alert">{loginError}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={checkingUser}>
            {checkingUser ? "Checking user..." : "Continue to dashboard"} <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [adminEmail, setAdminEmail] = useState(() => {
    const storedRole = localStorage.getItem("employee-demo-role");
    const storedEmail = localStorage.getItem("employee-demo-email");
    if (storedRole === "admin" || (!storedRole && storedEmail)) {
      localStorage.setItem("employee-demo-email", "admin@gmail.com");
      localStorage.setItem("employee-demo-role", "admin");
      localStorage.setItem("employee-demo-password", "admin123");
      return "admin@gmail.com";
    }
    return storedEmail || "";
  });
  const [loginRole, setLoginRole] = useState(() => localStorage.getItem("employee-demo-role") || "admin");
  const [theme, setTheme] = useState(() => localStorage.getItem("staffsync-theme") === "dark" ? "dark" : "light");

  function changeTheme(value) {
    localStorage.setItem("staffsync-theme", value);
    setTheme(value);
  }

  function signOut() {
    localStorage.removeItem("employee-demo-email");
    localStorage.removeItem("employee-demo-role");
    localStorage.removeItem("employee-demo-password");
    setAdminEmail("");
    setLoginRole("admin");
  }

  function signIn(email, role) {
    localStorage.setItem("employee-demo-email", email);
    localStorage.setItem("employee-demo-role", role);
    setAdminEmail(email);
    setLoginRole(role);
  }

  if (!adminEmail) return <AdminLogin onLogin={signIn} theme={theme} />;
  return <EmployeeDashboard adminEmail={adminEmail} loginRole={loginRole} onLogout={signOut} theme={theme} onThemeChange={changeTheme} />;
}

export default App;
