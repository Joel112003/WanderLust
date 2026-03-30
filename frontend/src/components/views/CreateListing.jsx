import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import AvailabilityPicker from "./AvailabilityPicker";

const Icon = ({ d, size = 24, className = "", strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);
const HomeIcon = () => (
  <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
);
const PinIcon = () => (
  <Icon
    d={[
      "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
      "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    ]}
  />
);
const GearIcon = () => (
  <Icon
    d={[
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    ]}
  />
);
const ImgIcon = () => (
  <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
);
const DollarIcon = () => (
  <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
);
const CheckIcon = () => <Icon d="M5 13l4 4L19 7" strokeWidth={2.5} />;
const XIcon = () => <Icon d="M6 18L18 6M6 6l12 12" />;
const UploadIcon = () => (
  <Icon
    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    size={40}
  />
);
const ChevLeft = () => <Icon d="M15 19l-7-7 7-7" size={20} />;
const ChevRight = () => <Icon d="M9 5l7 7-7 7" size={20} />;
const PlusIcon = () => <Icon d="M12 6v6m0 0v6m0-6h6m-6 0H6" size={18} />;
const MinusIcon = () => <Icon d="M20 12H4" size={18} />;
const SparkleIcon = () => (
  <Icon
    d="M5 3l1.5 4.5L11 9l-4.5 1.5L5 15l-1.5-4.5L-1 9l4.5-1.5L5 3zm14 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
    size={20}
  />
);

const useForm = (initial) => {
  const [data, setData] = useState(initial);
  const set = useCallback(
    (name, value) => setData((p) => ({ ...p, [name]: value })),
    [],
  );
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      set(name, type === "checkbox" ? checked : value);
    },
    [set],
  );
  return { data, set, handleChange, setData };
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);
  return { toast, show };
};

const Label = ({ children, required }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
    {children}
    {required && <span className="text-rose-500 ml-1">*</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 text-sm text-rose-500 flex items-center gap-1">
      <XIcon />
      {msg}
    </p>
  ) : null;

const inputBase = (error) =>
  `w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 transition-all duration-150 outline-none
   focus:ring-2 focus:ring-offset-0 ${
     error
       ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
       : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 hover:border-gray-300"
   }`;

const Field = ({ label, error, helper, required, children }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    {children}
    {helper && !error && (
      <p className="mt-1.5 text-sm text-gray-400">{helper}</p>
    )}
    <FieldError msg={error} />
  </div>
);

const Input = ({ label, error, helper, required, className = "", ...p }) => (
  <Field label={label} error={error} helper={helper} required={required}>
    <input className={`${inputBase(error)} ${className}`} {...p} />
  </Field>
);

const Textarea = ({
  label,
  error,
  helper,
  required,
  maxLength,
  rows = 4,
  className = "",
  ...p
}) => {
  const len = (p.value || "").length;
  return (
    <Field label={label} error={error} helper={helper} required={required}>
      <div className="relative">
        <textarea
          rows={rows}
          maxLength={maxLength}
          className={`${inputBase(error)} resize-none pr-2 ${className}`}
          {...p}
        />
        {maxLength && (
          <span
            className={`absolute bottom-3 right-3 text-xs ${len > maxLength * 0.9 ? "text-amber-500" : "text-gray-300"}`}
          >
            {len}/{maxLength}
          </span>
        )}
      </div>
    </Field>
  );
};

const Select = ({
  label,
  error,
  helper,
  required,
  children,
  className = "",
  ...p
}) => (
  <Field label={label} error={error} helper={helper} required={required}>
    <select
      className={`${inputBase(error)} cursor-pointer ${className}`}
      {...p}
    >
      {children}
    </select>
  </Field>
);

const Stepper = ({
  label,
  error,
  value,
  onChange,
  min = 1,
  max = 20,
  icon,
}) => (
  <Field label={label} error={error}>
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all
      ${error ? "border-rose-400" : "border-gray-200 hover:border-gray-300"}`}
    >
      {icon && <span className="text-gray-400 mr-2">{icon}</span>}
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors"
      >
        <MinusIcon />
      </button>
      <span className="text-xl font-bold text-gray-800 w-10 text-center">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors"
      >
        <PlusIcon />
      </button>
    </div>
  </Field>
);

const Chip = ({ children, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border
      ${
        selected
          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
  >
    {children}
  </button>
);

const Toggle = ({ label, subLabel, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
    <div>
      <p className="font-medium text-gray-800">{label}</p>
      {subLabel && <p className="text-sm text-gray-500">{subLabel}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2
        focus:ring-indigo-500 focus:ring-offset-2 ${checked ? "bg-indigo-600" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
        ${checked ? "translate-x-7" : "translate-x-1"}`}
      />
    </button>
  </div>
);

const ProgressBar = ({ pct }) => (
  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
      style={{ width: `${pct}%` }}
    />
  </div>
);

const Btn = ({
  children,
  variant = "primary",
  size = "md",
  disabled,
  onClick,
  type = "button",
  className = "",
}) => {
  const v = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg shadow-indigo-200",
    secondary:
      "bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
  }[variant];
  const s = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  }[size];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150
        active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${v} ${s} ${className}`}
    >
      {children}
    </button>
  );
};

const Spinner = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeOpacity=".25"
    />
    <path
      d="M12 2a10 10 0 010 20"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const STEPS = [
  { label: "Basics", icon: <HomeIcon /> },
  { label: "Location", icon: <PinIcon /> },
  { label: "Details", icon: <GearIcon /> },
  { label: "Photos", icon: <ImgIcon /> },
  { label: "Pricing", icon: <DollarIcon /> },
];

const AMENITIES = [
  { label: "WiFi", emoji: "📶" },
  { label: "Kitchen", emoji: "🍳" },
  { label: "Washer", emoji: "🫧" },
  { label: "Dryer", emoji: "♨️" },
  { label: "Air conditioning", emoji: "❄️" },
  { label: "Heating", emoji: "🔥" },
  { label: "TV", emoji: "📺" },
  { label: "Hot tub", emoji: "🛁" },
  { label: "Pool", emoji: "🏊" },
  { label: "Gym", emoji: "💪" },
  { label: "Free parking", emoji: "🅿️" },
  { label: "Pets allowed", emoji: "🐾" },
  { label: "Breakfast", emoji: "🥐" },
  { label: "Workspace", emoji: "💻" },
  { label: "Crib", emoji: "🍼" },
  { label: "Self check-in", emoji: "🔑" },
  { label: "Iron", emoji: "👔" },
  { label: "Hair dryer", emoji: "💇" },
];

const CATEGORIES = [
  { value: "Apartment", emoji: "🏢" },
  { value: "House", emoji: "🏠" },
  { value: "Cottage", emoji: "🏡" },
  { value: "Cabin", emoji: "🪵" },
  { value: "Mansion", emoji: "🏰" },
  { value: "Farm", emoji: "🚜" },
  { value: "Lake house", emoji: "🏞️" },
  { value: "Beach house", emoji: "🏖️" },
  { value: "Ski chalet", emoji: "⛷️" },
  { value: "Camping", emoji: "⛺" },
  { value: "Treehouse", emoji: "🌳" },
  { value: "Boat", emoji: "⛵" },
  { value: "Luxury villa", emoji: "💎" },
  { value: "Castle", emoji: "🏯" },
];

const INIT = {
  title: "",
  description: "",
  category: "",
  country: "",
  location: "",
  guests: 2,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  amenities: [],
  houseRules: "",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  instantBook: false,
  price: "",
  weeklyDiscount: 0,
  monthlyDiscount: 0,
  unavailableDates: [],
};

const validate = (step, data, images) => {
  const e = {};
  if (step === 0) {
    if (!data.title.trim()) e.title = "Title is required";
    else if (data.title.trim().length < 10)
      e.title = "Title must be at least 10 characters";
    if (!data.description.trim()) e.description = "Description is required";
    else if (data.description.trim().length < 30)
      e.description = "Description must be at least 30 characters";
    if (!data.category) e.category = "Please choose a category";
  }
  if (step === 1) {
    if (!data.country.trim()) e.country = "Country is required";
    if (!data.location.trim()) e.location = "City / location is required";
  }
  if (step === 3 && images.length === 0)
    e.images = "At least one photo is required";
  if (step === 4) {
    const p = Number(data.price);
    if (!data.price || isNaN(p) || p <= 0) e.price = "Enter a valid price";
  }
  return e;
};

const StepBasics = ({ data, errors, handleChange, setField }) => (
  <div className="space-y-6">
    <Input
      label="Property title"
      required
      name="title"
      value={data.title}
      onChange={handleChange}
      error={errors.title}
      placeholder="e.g. Sunny loft steps from the beach"
      helper={`${data.title.length}/80 characters`}
      maxLength={80}
    />
    <Textarea
      label="Description"
      required
      name="description"
      value={data.description}
      onChange={handleChange}
      error={errors.description}
      placeholder="What makes your place special? Share the vibe, location highlights, and any unique features…"
      rows={5}
      maxLength={500}
      helper="Tip: mention the neighbourhood, standout features, and who it's great for"
    />
    <div>
      <Label required>Category</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setField("category", c.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all
              ${data.category === c.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 hover:border-indigo-200 text-gray-600"}`}
          >
            <span className="text-2xl">{c.emoji}</span>
            {c.value}
          </button>
        ))}
      </div>
      <FieldError msg={errors.category} />
    </div>
  </div>
);

const StepLocation = ({ data, errors, handleChange }) => (
  <div className="space-y-6">
    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-700">
      ℹ️ Only the city and country are shown to guests. Your exact address is
      shared only after booking.
    </div>
    <Select
      label="Country"
      required
      name="country"
      value={data.country}
      onChange={handleChange}
      error={errors.country}
    >
      <option value="">Select a country…</option>
      {[
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
        "France",
        "Germany",
        "Italy",
        "Spain",
        "Japan",
        "India",
        "Brazil",
        "Mexico",
        "Portugal",
        "Netherlands",
        "New Zealand",
      ].map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </Select>
    <Input
      label="City / neighbourhood"
      required
      name="location"
      value={data.location}
      onChange={handleChange}
      error={errors.location}
      placeholder="e.g. Brooklyn, New York"
      helper="Be as specific as you're comfortable with"
    />
  </div>
);

const StepDetails = ({ data, errors, setField, handleChange }) => (
  <div className="space-y-8">
    <div>
      <h3 className="text-base font-semibold text-gray-700 mb-4">
        Accommodation
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <Stepper
          label="Guests"
          value={data.guests}
          min={1}
          max={30}
          error={errors.guests}
          onChange={(v) => setField("guests", v)}
        />
        <Stepper
          label="Bedrooms"
          value={data.bedrooms}
          min={1}
          max={20}
          error={errors.bedrooms}
          onChange={(v) => setField("bedrooms", v)}
        />
        <Stepper
          label="Beds"
          value={data.beds}
          min={1}
          max={30}
          error={errors.beds}
          onChange={(v) => setField("beds", v)}
        />
        <Stepper
          label="Bathrooms"
          value={data.baths}
          min={1}
          max={15}
          error={errors.baths}
          onChange={(v) => setField("baths", v)}
        />
      </div>
    </div>
    <div>
      <h3 className="text-base font-semibold text-gray-700 mb-3">Amenities</h3>
      <div className="flex flex-wrap gap-2">
        {AMENITIES.map(({ label, emoji }) => (
          <Chip
            key={label}
            selected={data.amenities.includes(label)}
            onClick={() =>
              setField(
                "amenities",
                data.amenities.includes(label)
                  ? data.amenities.filter((a) => a !== label)
                  : [...data.amenities, label],
              )
            }
          >
            {emoji} {label}
          </Chip>
        ))}
      </div>
      {data.amenities.length > 0 && (
        <p className="mt-2 text-sm text-indigo-600 font-medium">
          {data.amenities.length} selected
        </p>
      )}
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Check-in time"
        name="checkInTime"
        type="time"
        value={data.checkInTime}
        onChange={handleChange}
      />
      <Input
        label="Check-out time"
        name="checkOutTime"
        type="time"
        value={data.checkOutTime}
        onChange={handleChange}
      />
    </div>
    <Textarea
      label="House rules"
      name="houseRules"
      rows={3}
      value={data.houseRules}
      onChange={handleChange}
      placeholder="e.g. No parties, quiet hours after 10pm, no smoking indoors…"
    />
    <Toggle
      label="Instant Book"
      checked={data.instantBook}
      onChange={(v) => setField("instantBook", v)}
      subLabel="Guests can book without waiting for your approval"
    />

    <AvailabilityPicker
      unavailableDates={data.unavailableDates}
      onChange={(dates) => setField("unavailableDates", dates)}
    />
  </div>
);

const StepPhotos = ({ images, previews, onUpload, onRemove, error }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const handleDrag = (e) => {
    e.preventDefault();
    setDragging(e.type === "dragenter" || e.type === "dragover");
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onUpload(e.dataTransfer.files);
  };
  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-12 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-200 text-center
          ${dragging ? "border-indigo-500 bg-indigo-50 scale-[1.01]" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <span
          className={`text-gray-300 transition-colors ${dragging ? "text-indigo-400" : ""}`}
        >
          <UploadIcon />
        </span>
        <div>
          <p className="font-semibold text-gray-700">
            {dragging ? "Drop to upload" : "Drag photos here"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            or click to browse · JPEG, PNG, WebP · max 10MB · up to 10 photos
          </p>
        </div>
        <Btn
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          <PlusIcon /> Choose files
        </Btn>
      </div>
      {previews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">
              {previews.length}/10 photos uploaded
            </h3>
            <span className="text-xs text-gray-400">
              First photo will be the cover
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative group aspect-square">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all" />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full shadow
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all
                    hover:bg-rose-50 text-gray-600 hover:text-rose-500"
                >
                  <XIcon />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-rose-500 text-sm p-3 bg-rose-50 rounded-xl">
          <XIcon /> {error}
        </div>
      )}
    </div>
  );
};

const StepPricing = ({ data, errors, handleChange, setField }) => {
  const price = Number(data.price) || 0;
  const weeklyPrice = price * 7 * (1 - data.weeklyDiscount / 100);
  const monthlyPrice = price * 30 * (1 - data.monthlyDiscount / 100);
  return (
    <div className="space-y-8">
      <Input
        label="Nightly rate (USD)"
        required
        name="price"
        type="number"
        value={data.price}
        onChange={handleChange}
        error={errors.price}
        placeholder="0"
        helper="You can change this anytime. Airbnb adds a service fee on top."
      />
      <div className="space-y-5">
        <h3 className="font-semibold text-gray-700">
          Discounts{" "}
          <span className="text-gray-400 font-normal text-sm">— optional</span>
        </h3>
        {[
          {
            key: "weeklyDiscount",
            label: "Weekly discount",
            stays: "7+ nights",
          },
          {
            key: "monthlyDiscount",
            label: "Monthly discount",
            stays: "28+ nights",
          },
        ].map(({ key, label, stays }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{stays}</p>
              </div>
              <span className="text-2xl font-bold text-indigo-600 w-16 text-right">
                {data[key]}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={data[key]}
                onChange={(e) => setField(key, parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-100
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-300 mt-1 px-0.5">
                {[0, 10, 20, 30, 40, 50].map((v) => (
                  <span key={v}>{v}%</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {price > 0 && (
        <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
            <SparkleIcon /> Earnings preview
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Per night</span>
              <span className="font-bold text-gray-900">
                ${price.toFixed(2)}
              </span>
            </div>
            {data.weeklyDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Per week{" "}
                  <span className="text-green-600">
                    (-{data.weeklyDiscount}%)
                  </span>
                </span>
                <span className="font-bold text-gray-900">
                  ${weeklyPrice.toFixed(2)}
                </span>
              </div>
            )}
            {data.monthlyDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Per month{" "}
                  <span className="text-green-600">
                    (-{data.monthlyDiscount}%)
                  </span>
                </span>
                <span className="font-bold text-gray-900">
                  ${monthlyPrice.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-indigo-100">
              <div className="flex justify-between text-xs text-gray-400">
                <span>After platform fee (~3%)</span>
                <span>~${(price * 0.97).toFixed(2)}/night</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SuccessOverlay = () => (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
    <div
      className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full"
      style={{ animation: "bounceIn 0.5s cubic-bezier(.34,1.56,.64,1) both" }}
    >
<div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: "spinOnce 0.7s cubic-bezier(.34,1.56,.64,1) 0.3s both",
            }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
<div
          className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
          style={{
            animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1) 0.7s both",
            opacity: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Submitted for review!
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-7">
        Your listing is{" "}
        <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          pending approval
        </span>
        . Once an admin reviews it, it will appear publicly on the listings
        page.
      </p>
<div className="flex items-center justify-center gap-1">
        {[
          { icon: "✓", label: "Submitted", done: true, active: false },
          { icon: "⏳", label: "Under review", done: false, active: true },
          { icon: "🌍", label: "Goes live", done: false, active: false },
        ].map((s, i) => (
          <React.Fragment key={i}>
            <div
              className="flex flex-col items-center gap-1.5"
              style={{
                animation: `popIn 0.4s cubic-bezier(.34,1.56,.64,1) ${0.9 + i * 0.12}s both`,
                opacity: 0,
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${
                  s.done
                    ? "bg-green-100 text-green-600 ring-2 ring-green-200"
                    : s.active
                      ? "bg-amber-100 text-amber-600 ring-2 ring-amber-300 shadow-sm"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.icon}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap
                ${s.done ? "text-green-600" : s.active ? "text-amber-600" : "text-gray-400"}`}
              >
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className="w-8 h-px bg-gray-200 mb-4 mx-1"
                style={{
                  animation: `fadeIn 0.3s ease ${1.0 + i * 0.12}s both`,
                  opacity: 0,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export default function CreateListing() {
  const { data, set: setField, handleChange, setData } = useForm(INIT);
  const { toast, show: showToast } = useToast();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 20);
    return () => clearTimeout(t);
  }, [step]);

  const handleUpload = useCallback(
    (files) => {
      if (!files?.length) return;
      const valid = Array.from(files).filter((f) => {
        if (!f.type.startsWith("image/")) {
          showToast("Only image files are supported", "error");
          return false;
        }
        if (f.size > 10 * 1024 * 1024) {
          showToast(`${f.name} exceeds 10MB`, "error");
          return false;
        }
        return true;
      });
      if (images.length + valid.length > 10) {
        showToast("Maximum 10 photos allowed", "error");
        return;
      }
      setImages((p) => [...p, ...valid]);
      setPreviews((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))]);
    },
    [images.length, showToast],
  );

  const removeImage = useCallback(
    (i) => {
      URL.revokeObjectURL(previews[i]);
      setImages((p) => p.filter((_, j) => j !== i));
      setPreviews((p) => p.filter((_, j) => j !== i));
    },
    [previews],
  );

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), []);

  const goNext = () => {
    const e = validate(step, data, images);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErr = {};
    for (let i = 0; i < STEPS.length; i++)
      Object.assign(allErr, validate(i, data, images));
    if (Object.keys(allErr).length) {
      setErrors(allErr);
      showToast("Please fix all errors first", "error");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      showToast("You must be logged in to create a listing", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);

      formData.append("pricing", JSON.stringify({
        basePrice: data.price,
        finalPrice: data.price,
        platformFee: 0,
        taxAmount: 0,
        cleaningFee: 0,
        isAllInclusive: true
      }));

      formData.append("country", data.country);
      formData.append("location", data.location);
      formData.append("category", data.category);
      formData.append("guests", data.guests);
      formData.append("bedrooms", data.bedrooms);
      formData.append("beds", data.beds);
      formData.append("baths", data.baths);
      formData.append("houseRules", data.houseRules || "");
      formData.append("checkInTime", data.checkInTime || "15:00");
      formData.append("checkOutTime", data.checkOutTime || "11:00");
      formData.append("instantBook", data.instantBook || false);
      formData.append("weeklyDiscount", data.weeklyDiscount || 0);
      formData.append("monthlyDiscount", data.monthlyDiscount || 0);
      formData.append("amenities", JSON.stringify(data.amenities));
      formData.append("image", images[0]);
      formData.append(
        "unavailableDates",
        JSON.stringify(data.unavailableDates),
      );

      const response = await fetch("http://localhost:8000/listings", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Unexpected server response (${response.status}). Check your backend is running.`,
        );
      }

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to create listing");

      setSuccess(true);
      showToast("Listing submitted for review! ⏳");
      setTimeout(() => {
        setData(INIT);
        setImages([]);
        setPreviews([]);
        setStep(0);
        setSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Submit error:", err);
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const pct = ((step + 1) / STEPS.length) * 100;
  const stepProps = { data, errors, handleChange, setField };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 py-10 px-4">
{success && <SuccessOverlay />}

      <div className="max-w-2xl mx-auto space-y-5">
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create a listing
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Step {step + 1} of {STEPS.length} — {STEPS[step].label}
              </p>
            </div>
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {Math.round(pct)}% done
            </span>
          </div>
          <ProgressBar pct={pct} />
          <div className="flex items-center mt-5 gap-1">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all
                    ${i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-gray-100 text-gray-400"}`}
                  >
                    {i < step ? <CheckIcon /> : s.icon}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium hidden sm:block ${i <= step ? "text-gray-700" : "text-gray-300"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 rounded ${i < step ? "bg-indigo-500" : "bg-gray-100"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
<div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 sm:p-8" ref={contentRef}>
            {step === 0 && <StepBasics {...stepProps} />}
            {step === 1 && <StepLocation {...stepProps} />}
            {step === 2 && <StepDetails {...stepProps} />}
            {step === 3 && (
              <StepPhotos
                images={images}
                previews={previews}
                onUpload={handleUpload}
                onRemove={removeImage}
                error={errors.images}
              />
            )}
            {step === 4 && <StepPricing {...stepProps} />}
          </div>
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl">
            <Btn variant="secondary" onClick={goBack} disabled={step === 0}>
              <ChevLeft /> Back
            </Btn>
            {step < STEPS.length - 1 ? (
              <Btn onClick={goNext} size="md">
                Continue <ChevRight />
              </Btn>
            ) : (
              <Btn
                onClick={handleSubmit}
                disabled={submitting}
                size="md"
                type="submit"
              >
                {submitting ? (
                  <>
                    <Spinner size={18} /> Submitting…
                  </>
                ) : (
                  <>
                    Submit for review <SparkleIcon />
                  </>
                )}
              </Btn>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Your listing will be reviewed by our team before going live. This
          usually takes under 24 hours.
        </p>
      </div>
{toast && (
        <div
          key={toast.id}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl
          text-sm font-medium max-w-xs border
          ${toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
          style={{ animation: "slideUp 0.25s ease both" }}
        >
          {toast.type === "error" ? <XIcon /> : <CheckIcon />}
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes bounceIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spinOnce {
          from { opacity: 0; transform: rotate(-180deg) scale(0.5); }
          to   { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
