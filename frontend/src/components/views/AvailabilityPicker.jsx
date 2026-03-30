import { useState } from "react";

const fmt = (date) => date.toISOString().split("T")[0];
const today = fmt(new Date());

export default function AvailabilityPicker({ unavailableDates = [], onChange }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");

  const addRange = () => {
    setError("");

    if (!from || !to) {
      setError("Please select both a start and end date.");
      return;
    }

    if (from >= to) {
      setError("End date must be after start date.");
      return;
    }

    const overlaps = unavailableDates.some(
      (r) => !(to <= r.from || from >= r.to)
    );

    if (overlaps) {
      setError("This range overlaps an existing blocked period.");
      return;
    }

    onChange([...unavailableDates, { from, to }]);
    setFrom("");
    setTo("");
  };

  const remove = (i) =>
    onChange(unavailableDates.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">Availability</h3>

      <div className="flex gap-3">
        <input
          type="date"
          value={from}
          min={today}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          value={to}
          min={from || today}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <button
          type="button"
          onClick={addRange}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Block
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {unavailableDates.map((r, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{r.from} → {r.to}</span>
          <button onClick={() => remove(i)} className="text-red-500">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
