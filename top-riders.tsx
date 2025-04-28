'use client';
import { useEffect, useState, useCallback } from "react";
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';


export default function TopRiders() {

  type Rider = {
    id: string;
    name: string;
  }

  const [availableRiders, setAvailableRiders] = useState<{ id: string; name: string }[]>([]);
  const [selectedRiders, setSelectedRiders] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users-riders`); 
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch riders");
        }
        const data = await response.json();
        setAvailableRiders(data.map((rider: any) => ({ id: rider.id, name: rider.name })));
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  
  useEffect(() => {
    if (!loading && !error) {
      new TomSelect('#riders-select', {
        create: false,
        onChange: handleSelectChange,
      });
    }
  }, [loading, error]);

  const handleSelectChange = (value: string) => {
    if (selectedRiders.length >= 5) {
      alert('You can only select up to 5 riders.');
      return;
    }

    const selectedRider = availableRiders.find(rider => rider.id === value);
    if (!selectedRider) return;

    if (selectedRiders.some(rider => rider.id === selectedRider.id)) {
      alert('This rider is already selected.');
      return;
    }

    setSelectedRiders([...selectedRiders, selectedRider]);
    setAvailableRiders(availableRiders.filter(rider => rider.id !== value));
  };

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedRiders);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedRiders(items);
  }, [selectedRiders]);

  const validateSelectedRiders = () => {
    if (selectedRiders.length !== 5) {
      return 'Please select exactly 5 riders.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateSelectedRiders();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null); // Clear previous errors
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedRiders }),
      });

      if (response.ok) {
        alert('Riders submitted successfully!');
      } else {
        alert('Failed to submit riders.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div aria-live="polite">Loading riders...</div>;
  }

  if (error) {
    return <div aria-live="polite" className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-7">
      <h1 className="text-2xl font-bold mb-4">Tour De France Tierlist</h1>
      <label htmlFor="rider-select" className="block mb-2">
        Select your top 5 Tour De France riders.
      </label>
      <select
        id="riders-select"
        className="w-full border px-2 py-1 mb-4"
        aria-label="Select a rider"
      >
        <option value="">Select a rider</option>
        {availableRiders.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="riders" isDropDisabled={false}>
          {(provided) => (
            <ul
              className="space-y-2 border rounded p-4 bg-gray-50 shadow-md"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {selectedRiders.map((rider, index) => (
                <DraggableRider key={rider.id} rider={rider} index={index} />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {validationError && <p className="text-red-500">{validationError}</p>}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
}

const DraggableRider = ({ rider, index }: { rider: { id: string; name: string }; index: number }) => (
  <Draggable key={rider.id} draggableId={rider.id} index={index}>
    {(provided) => (
      <li
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="bg-white p-2 rounded shadow"
      >
        {index + 1}. {rider.name}
      </li>
    )}
  </Draggable>
);