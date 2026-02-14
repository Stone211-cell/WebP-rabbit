'use client';

import * as React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSearch: (value: string) => void;
    isLoading?: boolean;
}

export function SearchInput({ onSearch, isLoading, className, ...props }: SearchInputProps) {
    const [value, setValue] = React.useState('');

    // Simple debounce implementation inside component if hook doesn't exist
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(value);
        }, 500);

        return () => clearTimeout(timer);
    }, [value, onSearch]);

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-9 pr-9 bg-[#1e293b] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                placeholder="ค้นหา..."
                {...props}
            />
            {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
            )}
        </div>
    );
}
