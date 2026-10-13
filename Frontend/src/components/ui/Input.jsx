import React, { useState } from 'react';

const Input = ({
    label,
    placeholder,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    name,
    id,
    disabled = false,
    required = false,
    icon: Icon,
    className = '',
    ...props
}) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || name;

    return (
        <div className={`w-full flex flex-col gap-1 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-semibold mb-2 text-ink"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink-soft pointer-events-none" />
                )}

                <input
                    id={inputId}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={(e) => {
                        setFocused(false);
                        if (onBlur) onBlur(e);
                    }}
                    className={`
                        w-full px-4 py-3 rounded-xl font-medium
                        transition-all duration-300 ease-in-out
                        bg-surface !text-ink
                        placeholder:!text-ink-soft
                        border-2
                        ${focused ? 'border-green-500 ring-2 ring-green-200/50' : 'border-outline'}
                        ${error ? 'border-red-500 ring-2 ring-red-200/50' : ''}
                        ${Icon ? 'pl-12' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    {...props}
                />
            </div>

            {error && (
                <p className="text-red-500 text-sm font-medium mt-1.5">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;