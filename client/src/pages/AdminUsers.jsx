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
    const [taskSearch, setTaskSearch] = useState("");

    // New task form state
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskStatus, setNewTaskStatus] = useState("backlog");
    const [newTaskAssignedUsers, setNewTaskAssignedUsers] = useState([]);
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

    const toggleUserSelection = (userId) => {
        if (newTaskAssignedUsers.includes(userId)) {
            setNewTaskAssignedUsers(newTaskAssignedUsers.filter(id => id !== userId));
        } else {
            setNewTaskAssignedUsers([...newTaskAssignedUsers, userId]);
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) {
            alert("Task title cannot be empty");
            return;
        }
        if (newTaskAssignedUsers.length === 0) {
            alert("Please select at least one user to assign the task");
            return;
        }
        setAddingTask(true);
        try {
            await axios.post("/tasks", {
                title: newTaskTitle,
                description: newTaskDescription,
                status: newTaskStatus,
                assignedTo: newTaskAssignedUsers,
            });
            alert("Task created and assigned");
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskStatus("backlog");
            setNewTaskAssignedUsers([]);
            fetchUsers();
            fetchTasks();
        } catch (err) {
            alert("Failed to create task");
        }
        setAddingTask(false);
    };

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(taskSearch.toLowerCase())
    );

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
                <h3 className="text-xl font-semibold mb-2">Create New Task for Users</h3>
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
                    <div className="flex flex-wrap max-h-40 overflow-y-auto border rounded p-2 gap-2">
                        {users.map((user) => (
                            <button
                                key={user._id}
                                type="button"
                                onClick={() => toggleUserSelection(user._id)}
                                className={`px-3 py-1 rounded border ${
                                    newTaskAssignedUsers.includes(user._id)
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700"
                                }`}
                            >
                                {user.name}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleCreateTask}
                        disabled={addingTask}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {addingTask ? "Creating..." : "Create Task"}
                    </button>
                </div>
            </div>

            <div className="border p-4 rounded shadow max-w-6xl mx-auto mt-6">
                <h3 className="text-xl font-semibold mb-2">Tasks</h3>
                <input
                    type="text"
                    placeholder="Search tasks by title"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="border rounded px-2 py-1 mb-4 w-full max-w-md"
                />
                <table className="min-w-full bg-white border border-gray-300 rounded">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Title</th>
                            <th className="py-2 px-4 border-b">Description</th>
                            <th className="py-2 px-4 border-b">Status</th>
                            <th className="py-2 px-4 border-b">Assigned Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map((task) => (
                            <tr key={task._id} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">{task.title}</td>
                                <td className="py-2 px-4 border-b">{task.description}</td>
                                <td className="py-2 px-4 border-b">{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</td>
                                <td className="py-2 px-4 border-b">
                                    {task.assignedTo && task.assignedTo.length > 0
                                        ? task.assignedTo.map(user => user.name).join(", ")
                                        : "No users assigned"}
                                </td>
                            </tr>
                        ))}
                        {filteredTasks.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    No tasks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUsers;
