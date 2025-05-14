import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-gray-800 text-white p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between">
                <div className="text-xl font-bold">Task Management</div>
                <button
                    className="md:hidden"
                    onClick={() => {
                        const menu = document.getElementById("mobile-menu");
                        if (menu.classList.contains("hidden")) {
                            menu.classList.remove("hidden");
                        } else {
                            menu.classList.add("hidden");
                        }
                    }}
                    aria-label="Toggle menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <div
                id="mobile-menu"
                className="hidden md:flex flex-col md:flex-row md:items-center md:space-x-6 mt-4 md:mt-0"
            >
                <Link to="/Dashboard" className="block px-2 py-1 hover:bg-gray-700 rounded">
                    Dashboard
                </Link>
                <Link to="/tasks" className="block px-2 py-1 hover:bg-gray-700 rounded">
                    Task Board
                </Link>

                {user?.role === "admin" && (
                    <>
                        <div className="border-t border-gray-700 my-2 md:hidden"></div>
                        <div className="relative group">
                            <button className="block px-2 py-1 hover:bg-gray-700 rounded w-full text-left md:w-auto">
                                Admin
                            </button>
                            <div className="absolute left-0 mt-1 w-48 bg-gray-700 rounded shadow-lg hidden group-hover:block z-10">
                                <Link
                                    to="/admin/users"
                                    className="block px-4 py-2 hover:bg-gray-600 rounded"
                                >
                                    Manage Users
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                <button
                    onClick={handleLogout}
                    className="block px-2 py-1 hover:bg-gray-700 rounded text-left md:text-center md:inline md:ml-4"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navigation;
