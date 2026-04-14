import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const AdminSelect = ({
  value,
  onChange,
  options = [],
  className = '',
  menuAlign = 'left',
  menuPlacement = 'bottom',
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value) || options[0],
    [options, value]
  );

  useEffect(() => {
    const onClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{selected?.label || 'Select'}</span>
        <ChevronDown
          size={15}
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 min-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ${
            menuAlign === 'right' ? 'right-0' : 'left-0'
          } ${
            menuPlacement === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
          }`}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`block w-full px-3.5 py-2.5 text-left text-sm transition-colors ${
                  active
                    ? 'bg-red-50 font-semibold text-red-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSelect;
