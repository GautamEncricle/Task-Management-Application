import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TaskCard({ id, task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            type: 'task',
            task
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white p-3 mb-2 rounded shadow cursor-pointer border"
        >
            <h4 className="font-semibold">{task.title}</h4>
            <p className="text-sm text-gray-600">{task.description}</p>
        </div>
    );
}

export default TaskCard;