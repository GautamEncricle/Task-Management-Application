import axios from '../api/axios'
import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

function Signup() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/auth/signup', form);
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            navigate('/Dashboard');
        }
        catch (error) {
            console.error(error.response?.data?.message || "signup failed");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Sign Up</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-300">Sign Up</button>
            </form>
        </div>
    )
}

export default Signup
