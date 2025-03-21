import { useState, useEffect } from "react";
import { FiUsers, FiSettings, FiHome, FiMoon, FiSun, FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { format } from "date-fns";
import axios from "axios";
import "./adminDasboard.css";

interface User {
  id: number;
  name?: string;
  email?: string;
  role?: boolean; // true = Admin, false = User
  status?: "Active" | "Inactive";
  lastLogin?: Date;
}

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    axios.get("http://localhost:8080/api/users")
      .then(response => {
        const fetchedUsers = response.data.map((user: any) => ({
          ...user,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        }));
        setUsers(fetchedUsers);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handleAddUser = (userData: Omit<User, "id">) => {
    setUsers([...users, { ...userData, id: users.length + 1 }]);
    setShowAddModal(false);
  };

  const handleEditUser = (userData: User) => {
    setUsers(users.map(user => user.id === userData.id ? userData : user));
    setShowEditModal(false);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    const roleString = user.role ? "Admin" : "User";
    const matchesRole = roleFilter === "All" || roleString === roleFilter;

    const matchesStatus = statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className={`admin-dashboard ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{sidebarOpen ? "Admin Panel" : ""}</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle">
            <HiOutlineUserGroup className="icon" />
          </button>
        </div>
        <nav className="sidebar-menu">
          <button className="menu-item">
            <FiHome className="icon" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button className="menu-item active">
            <FiUsers className="icon" />
            {sidebarOpen && <span>Users</span>}
          </button>
          <button className="menu-item">
            <FiSettings className="icon" />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="header">
            <h1>User Management</h1>
            <div className="header-actions">
              <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
                {darkMode ? <FiSun className="icon" /> : <FiMoon className="icon" />}
              </button>
              <button onClick={() => setShowAddModal(true)} className="add-button">
                <FiUserPlus className="icon" /> Add User
              </button>
            </div>
          </div>

          <div className="filters">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="user-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="name">{user.name}</div>
                        <div className="email">{user.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${user.role ? "admin" : "user"}`}>
                        {user.role ? "Admin" : "User"}
                      </span>
                    </td>
                    <td><span className={`tag ${user.status?.toLowerCase()}`}>{user.status}</span></td>
                    <td>{user.lastLogin ? format(user.lastLogin, "MMM dd, yyyy") : ""}</td>
                    <td className="actions">
                      <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }}><FiEdit2 /></button>
                      <button onClick={() => handleDeleteUser(user.id)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;