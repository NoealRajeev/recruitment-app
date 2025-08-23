"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Input } from "./Input";

interface AutocompleteInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  options: string[];
  onChangeValue?: (value: string) => void;
}

export const AutocompleteInput = React.forwardRef<
  HTMLInputElement,
  AutocompleteInputProps
>(({ className, label, error, options, onChangeValue, ...props }, ref) => {
  const [inputValue, setInputValue] = React.useState(props.value || "");
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(-1);
  const [dropdownPosition, setDropdownPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(String(inputValue).toLowerCase())
  );

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && filteredOptions.length > 0) {
        setIsOpen(true);
        setHighlightIndex(0);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  // Update dropdown position
  const updateDropdownPosition = () => {
    const input = inputRef.current;
    if (input) {
      const rect = input.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  React.useEffect(() => {
    if (isOpen) updateDropdownPosition();
  }, [isOpen, inputValue]);

  const selectOption = (val: string) => {
    setInputValue(val);
    onChangeValue?.(val);
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  return (
    <div className="space-y-1" ref={wrapperRef}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-grey-700"
        >
          {label}
          {props.required && <span className="text-[#FF0404] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Input
          {...props}
          value={inputValue}
          ref={(node) => {
            if (typeof ref === "function") ref(node);
            inputRef.current = node;
          }}
          onFocus={() => {
            setIsOpen(true);
            updateDropdownPosition();
          }}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChangeValue?.(e.target.value);
            setIsOpen(true);
            updateDropdownPosition();
          }}
          onKeyDown={handleKeyDown}
          className={cn("pr-10 !bg-transparent", className)}
        />
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
          size={20}
        />
      </div>
      {error && (
        <p className="text-sm text-[#FF0404]" role="alert">
          {error}
        </p>
      )}

      {isOpen &&
        filteredOptions.length > 0 &&
        dropdownPosition &&
        createPortal(
          <ul
            role="listbox"
            className="z-50 absolute max-h-60 w-auto overflow-auto rounded-md bg-white/90 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              minWidth: dropdownPosition.width,
              width: "max-content",
            }}
          >
            {filteredOptions.map((opt, i) => (
              <li
                key={opt}
                role="option"
                aria-selected={highlightIndex === i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOption(opt);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
                className={cn(
                  "cursor-pointer select-none py-2 px-4",
                  highlightIndex === i
                    ? "bg-[#4C187A]/85 text-white"
                    : "text-gray-900"
                )}
              >
                {opt}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
});
AutocompleteInput.displayName = "AutocompleteInput";
