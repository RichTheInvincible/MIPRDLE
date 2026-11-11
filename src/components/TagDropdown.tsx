import React, { useState, useEffect, useRef } from 'react';
import { loadCSV, loadMIPRDLECSV } from '../utils/CSVLoader';
import '../styles/TagDropdown.css';

interface TagDropdownProps {
    onSelect: (tag: string) => void;
    reset?: number;
    season?: string; // Optional: filter tags by season
    csvPath?: string; // Optional: path to CSV file (defaults to SSBMRank)
}

const TagDropdown: React.FC<TagDropdownProps> = ({ onSelect, reset, season, csvPath = '/Data - Data.csv' }) => {
    const [tags, setTags] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (csvPath === '/data.csv') {
            // Load MIPRDLE data
            loadMIPRDLECSV(csvPath).then(rows => {
                const tagList = rows
                    .map(row => row.Tag)
                    .filter((tag, i, arr) => tag && arr.indexOf(tag) === i)
                    .sort((a, b) => a.localeCompare(b));
                setTags(tagList);
                setFiltered(tagList);
            });
        } else {
            // Load SSBMRank data
            loadCSV(csvPath).then(rows => {
                const tagList = rows
                    .map(row => row.Tag)
                    .filter((tag, i, arr) => tag && arr.indexOf(tag) === i)
                    .sort((a, b) => a.localeCompare(b));
                setTags(tagList);
                setFiltered(tagList);
            });
        }
    }, [season, csvPath]);

    useEffect(() => {
        setFiltered(
            tags.filter(tag =>
                tag.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, tags]);

    useEffect(() => {
        setSearch('');
        setShowDropdown(false);
    }, [reset]);

    return (
        <div ref={dropdownRef} className="tag-dropdown-container">
            <input
                className="tag-search-input"
                type="text"
                value={search}
                onChange={e => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search Tag..."
                autoComplete="off"
            />
            {showDropdown && filtered.length > 0 && (
                <ul className="tag-dropdown-list">
                    {filtered.map(tag => (
                        <li
                            key={tag}
                            className="tag-dropdown-item"
                            onMouseDown={() => {
                                setSearch(tag);
                                setShowDropdown(false);
                                onSelect(tag);
                            }}
                        >
                            {tag}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TagDropdown;