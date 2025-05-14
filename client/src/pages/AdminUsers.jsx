import { useEffect, useState } from "react";
import axios from "../api/axios";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // New task form state
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskStatus, setNewTaskStatus] = useState("backlog");
    const [newTaskAssignedUser, setNewTaskAssignedUser] = useState("");
    const [addingTask, setAddingTask] = useState(false);

    const fetchUsers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterRole) params.role = filterRole;
            if (filterStatus) params.status = filterStatus;
            const res = await axios.get("/admin/users", { params });
            setUsers(res.data.users);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch users");
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await axios.get("/tasks");
            setTasks(res.data.tasks);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchTasks();
    }, [search, filterRole, filterStatus]);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`/admin/users/${userId}`);
            setUsers(users.filter((user) => user._id !== userId));
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
        } catch (err) {
            alert("Failed to update user role");
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await axios.put(`/admin/users/${userId}/status`, { status: newStatus });
            setUsers(users.map(user => user._id === userId ? { ...user, status: newStatus } : user));
        } catch (err) {
            alert("Failed to update user status");
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) {
            alert("Task title cannot be empty");
            return;
        }
        if (!newTaskAssignedUser) {
            alert("Please select a user to assign the task");
            return;
        }
        setAddingTask(true);
        try {
            await axios.post("/tasks", {
                title: newTaskTitle,
                description: newTaskDescription,
                status: newTaskStatus,
                assignedTo: newTaskAssignedUser,
            });
            alert("Task created and assigned");
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskStatus("backlog");
            setNewTaskAssignedUser("");
            fetchUsers();
            fetchTasks();
        } catch (err) {
            alert("Failed to create task");
        }
        setAddingTask(false);
    };

    if (loading) return <div className="p-4">Loading users...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>

            <div className="mb-4 flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-2 py-1 flex-grow"
                />
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-300 rounded">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Username</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Role</th>
                            <th className="py-2 px-4 border-b">Status</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">{user.name}</td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <select
                                        value={user.status}
                                        onChange={(e) => handleStatusChange(user._id, e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border p-4 rounded shadow max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold mb-2">Create New Task for User</h3>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="border rounded px-2 py-1 flex-grow"
                    />
                    <textarea
                        placeholder="Task description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="border rounded px-2 py-1 flex-grow"
                    />
                    <select
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="backlog">Backlog</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select
                        value={newTaskAssignedUser}
                        onChange={(e) => setNewTaskAssignedUser(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="">Select User</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleCreateTask}
                        disabled={addingTask}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {addingTask ? "Creating..." : "Create Task"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminUsers;
