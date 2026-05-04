import React, { useState, useEffect, useRef } from 'react';

const PasswordInput = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    required = false, 
    disabled = false,
    className = "",
    error = null,
    minLength = null,
    id = null
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const timeoutRef = useRef(null);

    const togglePasswordVisibility = () => {
        setShowPassword(true);
        
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Hide password after 0.8 seconds
        timeoutRef.current = setTimeout(() => {
            setShowPassword(false);
        }, 800);
    };

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="mb-3">
            {label && <label htmlFor={id || name} className="form-label">{label}</label>}
            <div className="position-relative">
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    id={id || name}
                    className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    minLength={minLength}
                    style={{ paddingRight: '2.5rem' }}
                />
                <button
                    type="button"
                    className="btn p-0"
                    onClick={togglePasswordVisibility}
                    disabled={disabled}
                    style={{ 
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: '#6c757d',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3
                    }}
                >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '14px' }}></i>
                </button>
                {error && <div className="invalid-feedback">{error}</div>}
            </div>
        </div>
    );
};

export default PasswordInput;