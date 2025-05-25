'use client'
import { useEffect, useState } from 'react';

import styles from './multiSelect.module.css';

export default function MultiSelect({ label, options, onChange }: {
    label: string;
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
}) {
    const [selectedOptions, setSelectedOptions] = useState(options);

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>

            <div className={styles.optionsContainer}>
                {
                    options.map(option => (
                        <div
                            key={option.value}
                            className={`${styles.option} ${selectedOptions.includes(option.value) ? styles.selected : ''}`}
                            onClick={() => {
                                const isSelected = selectedOptions.includes(option.value);
                                const newSelected = isSelected
                                    ? selectedOptions.filter(value => value !== option.value)
                                    : [...selectedOptions, option.value];

                                setSelectedOptions(newSelected);
                                onChange(newSelected);
                            }}
                        >
                            <label htmlFor={option.value}>{option.label}</label>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
