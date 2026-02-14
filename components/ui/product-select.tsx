'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { getProducts, Product } from '@/lib/api/products';

interface ProductSelectProps {
    value?: string;
    onChange: (value: string, product?: Product) => void;
    placeholder?: string;
}

export function ProductSelect({ value, onChange, placeholder = "เลือกสินค้า..." }: ProductSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Initial Fetch
    React.useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await getProducts(searchQuery);
                setProducts(data);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery]); // Re-fetch when search query changes (debounce handled by command input usually, but here we can rely on manual or effect)

    const selectedProduct = products.find((product) => product.id === value) || null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-[#1e293b] border-gray-700 text-white hover:bg-[#334155] hover:text-white"
                >
                    {value
                        ? products.find((product) => product.id === value)?.name
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-[#1e293b] border-gray-700 text-white">
                <Command className="bg-[#1e293b] text-white">
                    <CommandInput
                        placeholder="ค้นหาสินค้า..."
                        className="text-white placeholder:text-gray-500"
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {loading && <div className="p-2 text-sm text-center text-gray-400">Loading...</div>}
                        <CommandEmpty>ไม่พบสินค้า</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.name} // Command uses value for filtering by default
                                    onSelect={() => {
                                        onChange(product.id === value ? "" : product.id, product);
                                        setOpen(false);
                                    }}
                                    className="data-[selected='true']:bg-blue-600 data-[highlighted]:bg-blue-500 text-white"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === product.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {product.code} - {product.name} ({product.price} บาท)
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
