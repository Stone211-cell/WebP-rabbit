'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SearchInput } from '@/components/ui/search-input';
import { getProducts, createProduct, Product } from '@/lib/api/products';
import { toast } from "sonner"
import { Loader2, Plus } from 'lucide-react';

export default function ProductManagement() {
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [newProduct, setNewProduct] = React.useState<Partial<Product>>({});
    const [submitting, setSubmitting] = React.useState(false);

    // Fetch Products
    const fetchData = React.useCallback(async (query: string) => {
        setLoading(true);
        try {
            const data = await getProducts(query);
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData(search);
    }, [fetchData, search]);

    // Handle Create
    const handleCreate = async () => {
        if (!newProduct.code || !newProduct.name || !newProduct.price) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน (รหัส, ชื่อ, ราคา)");
            return;
        }

        setSubmitting(true);
        try {
            await createProduct(newProduct);
            setIsCreateOpen(false);
            setNewProduct({});
            fetchData(search); // Refresh list
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการสร้างสินค้า (รหัสอาจซ้ำ)");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen text-black bg-[#0f172a] p-6">
            <Card className="border border-gray-200 rounded-xl bg-[#1e293b] text-white border-none">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-semibold text-xl">จัดการสินค้า (Products)</CardTitle>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> เพิ่มสินค้าใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1e293b] text-white border-gray-700">
                            <DialogHeader>
                                <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code" className="text-white">รหัสสินค้า</Label>
                                    <Input
                                        id="code"
                                        className="bg-[#0f172a] border-gray-600 text-white"
                                        placeholder="Ex. P001"
                                        value={newProduct.code || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-white">ชื่อสินค้า</Label>
                                    <Input
                                        id="name"
                                        className="bg-[#0f172a] border-gray-600 text-white"
                                        placeholder="Ex. เนื้อไก่สด"
                                        value={newProduct.name || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price" className="text-white">ราคา (บาท)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        className="bg-[#0f172a] border-gray-600 text-white"
                                        placeholder="0.00"
                                        value={newProduct.price || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category" className="text-white">หมวดหมู่</Label>
                                    <Input
                                        id="category"
                                        className="bg-[#0f172a] border-gray-600 text-white"
                                        placeholder="Ex. อาหารสด"
                                        value={newProduct.category || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="bg-transparent text-white border-gray-600 hover:bg-gray-800">
                                    ยกเลิก
                                </Button>
                                <Button onClick={handleCreate} disabled={submitting} className="bg-blue-600 text-white hover:bg-blue-700">
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'บันทึก'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {/* Filter / Search */}
                    <div className="mb-6">
                        <SearchInput
                            onSearch={setSearch}
                            isLoading={loading}
                            placeholder="ค้นหารหัส, ชื่อสินค้า..."
                            className="max-w-md"
                        />
                    </div>

                    {/* Table */}
                    <div className="rounded-md border border-gray-700 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#334155]">
                                <TableRow className="border-gray-700 hover:bg-[#334155]">
                                    <TableHead className="text-gray-200">รหัส</TableHead>
                                    <TableHead className="text-gray-200">ชื่อสินค้า</TableHead>
                                    <TableHead className="text-gray-200">หมวดหมู่</TableHead>
                                    <TableHead className="text-right text-gray-200">ราคา</TableHead>
                                    <TableHead className="text-center text-gray-200">สถานะ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                            กำลังโหลดข้อมูล...
                                        </TableCell>
                                    </TableRow>
                                ) : products.length > 0 ? (
                                    products.map((product) => (
                                        <TableRow key={product.id} className="border-gray-700 hover:bg-[#1e293b]/50">
                                            <TableCell className="font-medium text-white">{product.code}</TableCell>
                                            <TableCell className="text-white">{product.name}</TableCell>
                                            <TableCell className="text-gray-400">{product.category || '-'}</TableCell>
                                            <TableCell className="text-right text-white">{product.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {product.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                            ไม่พบสินค้า
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
