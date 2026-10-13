import { useState } from 'react';
import Input from './Input';

function formatAadhaar(value) {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export default function AadhaarField({ value, onChange, error }) {
    const [touched, setTouched] = useState(false);
    const digits = (value || '').replace(/\D/g, '');
    const isValid = digits.length === 12;

    const handleChange = (e) => {
        onChange?.(formatAadhaar(e.target.value));
    };

    return (
        <Input
            label="Aadhaar Number"
            placeholder="XXXX XXXX XXXX"
            value={value}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            error={error || (touched && value && !isValid ? 'Enter a valid 12-digit Aadhaar number' : '')}
        />
    );
}