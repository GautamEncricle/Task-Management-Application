import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import TaskCard from "../component/TaskCard";

const STATUSES = ["backlog", "in-progress", "completed"];

function TaskBoard() {
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState({
        backlog: [],
        "in-progress": [],
        completed: [],
    });

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskStatus, setNewTaskStatus] = useState("backlog");
    const [addingTask, setAddingTask] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get("/tasks");
                setTasks(res.data.tasks);
            } catch (err) {
                console.error("Failed to fetch tasks", err);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        const grouped = {
            backlog: [],
            "in-progress": [],
            completed: [],
        };
        tasks.forEach((task) => grouped[task.status].push(task));
        setColumns(grouped);
    }, [tasks]);

    const handleUpdateTask = (updatedTask) => {
        setTasks((prev) =>
            prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );
    };

    const handleDeleteTask = (taskId) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeTask = tasks.find((t) => t._id === active.id);
        const currentStatus = activeTask.status;
        const newStatus = over.id;

        if (over.data?.current?.sortable) {
            const overTask = tasks.find((t) => t._id === over.id);
            if (currentStatus === overTask.status) {
                const sameStatusTasks = tasks.filter((t) => t.status === currentStatus);
                const draggedIndex = sameStatusTasks.findIndex((t) => t._id === active.id);
                const targetIndex = sameStatusTasks.findIndex((t) => t._id === over.id);
                if (draggedIndex === -1 || targetIndex === -1) return;

                const newOrder = calculateNewOrder(sameStatusTasks, draggedIndex, targetIndex);
                try {
                    await axios.put(`/tasks/${active.id}`, { order: newOrder });
                    setTasks((prev) =>
                        prev.map((t) => (t._id === active.id ? { ...t, order: newOrder } : t))
                    );
                } catch (err) {
                    console.error("Failed to update task order", err);
                }
                return;
            }
        }

        try {
            await axios.put(`/tasks/${active.id}`, { status: newStatus });
            setTasks((prev) =>
                prev.map((t) => (t._id === active.id ? { ...t, status: newStatus } : t))
            );
        } catch (err) {
            console.error("Failed to update task", err);
        }
    };

    const calculateNewOrder = (tasks, fromIndex, toIndex) => {
        if (toIndex === 0) return tasks[0].order - 1000;
        if (toIndex === tasks.length - 1) return tasks[tasks.length - 1].order + 1000;

        const prevTask = tasks[toIndex - 1];
        const nextTask = tasks[toIndex];
        return (prevTask.order + nextTask.order) / 2;
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            alert("Task title cannot be empty");
            return;
        }
        setAddingTask(true);
        try {
            const res = await axios.post("/tasks", {
                title: newTaskTitle,
                description: newTaskDescription,
                status: newTaskStatus,
            });
            setTasks((prev) => [...prev, res.data.task]);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setNewTaskStatus("backlog");
        } catch (err) {
            alert("Failed to add task");
        }
        setAddingTask(false);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Task Board</h2>

            <div className="mb-6 border p-4 rounded shadow max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold mb-2">Add New Task</h3>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="border rounded px-2 py-1 mb-2 md:mb-0 flex-grow"
                    />
                    <textarea
                        placeholder="Task description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="border rounded px-2 py-1 mb-2 md:mb-0 flex-grow"
                    />
                    <select
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value)}
                        className="border rounded px-2 py-1 mb-2 md:mb-0"
                    >
                        {STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddTask}
                        disabled={addingTask}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {addingTask ? "Adding..." : "Add Task"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {STATUSES.map((status) => (
                        <Column
                            key={status}
                            id={status}
                            tasks={columns[status]}
                            onUpdate={handleUpdateTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </DndContext>
            </div>
        </div>
    );
}

function Column({ id, tasks, onUpdate, onDelete }) {
    const { setNodeRef } = useDroppable({ id });

    const titleMap = {
        backlog: "Backlog",
        "in-progress": "In Progress",
        completed: "Completed",
    };

    const colorMap = {
        backlog: "bg-red-100",
        "in-progress": "bg-yellow-100",
        completed: "bg-green-100",
    };

    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

    return (
        <div ref={setNodeRef} className={`p-4 rounded shadow min-h-[300px] ${colorMap[id]}`}>
            <h3 className="text-xl font-semibold mb-2">{titleMap[id]}</h3>
            <SortableContext items={sortedTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                {sortedTasks.map((task) => (
                    <TaskCard
                        key={task._id}
                        id={task._id}
                        task={task}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                ))}
            </SortableContext>
        </div>
    );
}

export default TaskBoard;
