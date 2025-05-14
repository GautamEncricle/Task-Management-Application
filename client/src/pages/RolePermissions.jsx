import { useState, useEffect } from "react";
import axios from "../api/axios";

const allPermissions = ["view", "edit", "delete", "assign"];

function RolePermissions() {
    const [roles, setRoles] = useState([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [newRolePermissions, setNewRolePermissions] = useState([]);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axios.get("/admin/roles");
            setRoles(res.data.roles);
        } catch (err) {
            alert("Failed to fetch roles");
        }
    };

    const handlePermissionChange = (roleName, permission, checked) => {
        setRoles((prevRoles) =>
            prevRoles.map((role) => {
                if (role.name === roleName) {
                    let updatedPermissions = [...role.permissions];
                    if (checked) {
                        if (!updatedPermissions.includes(permission)) {
                            updatedPermissions.push(permission);
                        }
                    } else {
                        updatedPermissions = updatedPermissions.filter((p) => p !== permission);
                    }
                    return { ...role, permissions: updatedPermissions };
                }
                return role;
            })
        );
    };

    const handleUpdateRole = async (role) => {
        try {
            await axios.put(`/admin/roles/${role.name}`, { permissions: role.permissions });
            alert(`Role ${role.name} updated`);
        } catch (err) {
            alert("Failed to update role");
        }
    };

    const handleDeleteRole = async (roleName) => {
        if (!window.confirm(`Are you sure you want to delete role "${roleName}"?`)) return;
        try {
            await axios.delete(`/admin/roles/${roleName}`);
            setRoles((prev) => prev.filter((r) => r.name !== roleName));
        } catch (err) {
            alert("Failed to delete role");
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            alert("Role name cannot be empty");
            return;
        }
        try {
            await axios.post("/admin/roles", { name: newRoleName.trim(), permissions: newRolePermissions });
            setNewRoleName("");
            setNewRolePermissions([]);
            fetchRoles();
            alert("Role created");
        } catch (err) {
            alert("Failed to create role");
        }
    };

    const toggleNewRolePermission = (permission) => {
        setNewRolePermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Role & Permissions Management</h2>

            <div className="mb-6 border p-4 rounded shadow">
                <h3 className="text-xl font-semibold mb-2">Create New Role</h3>
                <input
                    type="text"
                    placeholder="Role name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="border rounded px-2 py-1 mr-4"
                />
                <div className="mb-2">
                    {allPermissions.map((perm) => (
                        <label key={perm} className="mr-4">
                            <input
                                type="checkbox"
                                checked={newRolePermissions.includes(perm)}
                                onChange={() => toggleNewRolePermission(perm)}
                            />{" "}
                            {perm}
                        </label>
                    ))}
                </div>
                <button
                    onClick={handleCreateRole}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create Role
                </button>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2">Existing Roles</h3>
                {roles.length === 0 && <p>No roles found.</p>}
                {roles.map((role) => (
                    <div key={role.name} className="mb-4 border p-4 rounded shadow">
                        <h4 className="font-semibold mb-2">{role.name}</h4>
                        <div className="mb-2">
                            {allPermissions.map((perm) => (
                                <label key={perm} className="mr-4">
                                    <input
                                        type="checkbox"
                                        checked={role.permissions.includes(perm)}
                                        onChange={(e) =>
                                            handlePermissionChange(role.name, perm, e.target.checked)
                                        }
                                    />{" "}
                                    {perm}
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={() => handleUpdateRole(role)}
                            className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                        >
                            Update
                        </button>
                        <button
                            onClick={() => handleDeleteRole(role.name)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RolePermissions;