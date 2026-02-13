import { useEffect, useState } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string | number;
  onChange: (value: string | number) => void;
  className?: string; 
  value?: string | number; // ✅ controlled value dari parent
  defaultValue?: string;
  required?: boolean
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value,
  defaultValue = "",
  required = false
}) => {
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string | number>(defaultValue);
  const [hintState, setHintState] = useState<string>('')
  // const [errorState, setErrorState] = useState<boolean>(false)

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()
    const value = e.target.value;
    setSelectedValue(value);
    if(!value && required) {
      setHintState('This field is required')
    }
    onChange(value); // Trigger parent handler
  };

  return (
    <>
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-base shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        selectedValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={selectedValue}
      required={required}
      onChange={handleChange}
    >
      {/* Placeholder option */}
      <option
        value=""
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {/* Map over options */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
    {hintState && (
      <p
        className={`mt-1.5 text-xs text-error-500`}
      >
        {hintState}
      </p>
    )}
    </>
  );
};

export default Select;
