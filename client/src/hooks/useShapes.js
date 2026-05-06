import { useState } from "react";

export default function useShapes() {
    const [shapes, setShapes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [dragInfo, setDragInfo] = useState(null);
    const [resizeInfo, setResizeInfo] = useState(null);
    const [shapeDraft, setShapeDraft] = useState(null);

    const deleteShapeLocally = (id) => {
        setShapes(prev => prev.filter(s => s.id !== id));
        setSelectedId(null);
    };

    return {
        shapes, setShapes,
        selectedId, setSelectedId,
        dragInfo, setDragInfo,
        resizeInfo, setResizeInfo,
        shapeDraft, setShapeDraft,
        deleteShapeLocally
    };
}
