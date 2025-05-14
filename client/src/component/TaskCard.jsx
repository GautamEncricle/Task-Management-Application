import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import axios from "../api/axios";
import { GripVertical } from "lucide-react"; 

function TaskCard({ id, task, onUpdate, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: { type: "task", task },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description);

    const handleUpdate = async () => {
        try {
            const res = await axios.put(`/tasks/${task._id}`, {
                title: editedTitle,
                description: editedDescription,
            });
            onUpdate(res.data.task);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update task", err);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await axios.delete(`/tasks/${task._id}`);
            onDelete(task._id);
        } catch (err) {
            console.error("Failed to delete task", err);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white p-3 mb-2 rounded shadow border relative flex flex-col"
        >
            {/* Drag Handle */}
            <div className="absolute top-1 left-2 cursor-grab" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>

            {isEditing ? (
                <div className="mt-4"> {/* offset drag handle */}
                    <input
                        className="w-full font-semibold border-b mb-1"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                    />
                    <textarea
                        className="w-full text-sm text-gray-600 border rounded"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                    />
                    <div className="flex justify-end mt-2 gap-2">
                        <button
                            onClick={handleUpdate}
                            className="text-sm bg-green-500 text-white px-2 py-1 rounded"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-sm bg-gray-300 px-2 py-1 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-4">
                    <h4
                        className="font-semibold cursor-pointer"
                        onClick={() => setIsEditing(true)}
                    >
                        {task.title}
                    </h4>
                    <p
                        className="text-sm text-gray-600 cursor-pointer"
                        onClick={() => setIsEditing(true)}
                    >
                        {task.description}
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        className="absolute top-1 right-2 text-red-500 text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}

export default TaskCard;