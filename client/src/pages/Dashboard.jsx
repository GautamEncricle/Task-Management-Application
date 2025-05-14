import { useState, useEffect } from "react"
import axios from "../api/axios"
import { useAuth } from "../context/AuthContext"

function Dashboard() {
    const { user } = useAuth;
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const statusCount = {
        backlog: 0,
        "In-progress": 0,
        completed: 0,
    }

    tasks.forEach((task) => statusCount[task.status] += 1);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await axios.get("/tasks");
                setTasks(res.data.tasks);
                console.log(tasks)
            }
            catch (err) {
                console.error("Failed to load tasks:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTask();
    }, [])

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome, {user?.name}</h1>

            {loading ? (
                <p>Loading tasks...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Total Tasks" count={tasks.length} color="bg-gray-800" />
                    <Card title="Backlog" count={statusCount.backlog} color="bg-red-600" />
                    <Card title="In Progress" count={statusCount["in-progress"]} color="bg-yellow-500" />
                    <Card title="Completed" count={statusCount.completed} color="bg-green-600" />
                </div>
            )}
        </div>
    );
}

function Card({ title, count, color }) {
    return (
        <div className={`p-6 text-white rounded shadow ${color}`}>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-3xl font-bold">{count}</p>
        </div>
    )
}

export default Dashboard