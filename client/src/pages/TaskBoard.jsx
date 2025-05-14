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

    const sensors = useSensors(useSensor(PointerSensor));

    // Fetch tasks from API
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

    // Group tasks by status
    useEffect(() => {
        const grouped = {
            backlog: [],
            "in-progress": [],
            completed: [],
        };
        tasks.forEach((task) => grouped[task.status].push(task));
        setColumns(grouped);
    }, [tasks]);

    // Handle drag and drop
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const activeTask = tasks.find((t) => t._id === active.id);

        const currentStatus = activeTask.status;
        const newStatus = over.id;

        // If dragged over another task (not a column)
        if (over.data?.current?.sortable) {
            const overTask = tasks.find((t) => t._id === over.id);

            // If moving within the same column
            if (currentStatus === overTask.status) {
                // Find tasks in the same column
                const sameStatusTasks = tasks.filter((t) => t.status === currentStatus);
                const draggedIndex = sameStatusTasks.findIndex((t) => t._id === active.id);
                const targetIndex = sameStatusTasks.findIndex((t) => t._id === over.id);

                if (draggedIndex === -1 || targetIndex === -1) return;

                // Calculate new order based on surrounding tasks
                const newOrder = calculateNewOrder(sameStatusTasks, draggedIndex, targetIndex);

                try {
                    // Update the order on the server
                    await axios.put(`/tasks/${active.id}`, { order: newOrder });

                    // Update local state
                    setTasks((prev) =>
                        prev.map((t) =>
                            t._id === active.id ? { ...t, order: newOrder } : t
                        )
                    );
                } catch (err) {
                    console.error("Failed to update task order", err);
                }
                return;
            }
        }

        // If moved to a different column → update status via API
        try {
            await axios.put(`/tasks/${active.id}`, { status: newStatus });

            setTasks((prev) =>
                prev.map((t) =>
                    t._id === active.id ? { ...t, status: newStatus } : t
                )
            );
        } catch (err) {
            console.error("Failed to update task", err);
        }
    };

    // Helper function to calculate new order value
    const calculateNewOrder = (tasks, fromIndex, toIndex) => {
        // If moving to the beginning
        if (toIndex === 0) {
            const firstTask = tasks[0];
            return firstTask.order - 1000; // Place before the first task
        }

        // If moving to the end
        if (toIndex === tasks.length - 1) {
            const lastTask = tasks[tasks.length - 1];
            return lastTask.order + 1000; // Place after the last task
        }

        // If moving in between tasks
        const prevTask = tasks[toIndex - 1];
        const nextTask = tasks[toIndex];

        // Calculate position between the two tasks
        return (prevTask.order + nextTask.order) / 2;
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Task Board</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {STATUSES.map((status) => (
                        <Column key={status} id={status} tasks={columns[status]} />
                    ))}
                </DndContext>
            </div>
        </div>
    );
}

function Column({ id, tasks }) {
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

    // Sort tasks by order
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

    return (
        <div ref={setNodeRef} className={`p-4 rounded shadow min-h-[300px] ${colorMap[id]}`}>
            <h3 className="text-xl font-semibold mb-2">{titleMap[id]}</h3>

            <SortableContext items={sortedTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                {sortedTasks.map((task) => (
                    <TaskCard key={task._id} id={task._id} task={task} />
                ))}
            </SortableContext>
        </div>
    );
}

export default TaskBoard;