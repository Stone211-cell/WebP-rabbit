// 'use client';

// import * as React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
//     DialogFooter,
//     DialogClose,
// } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { SearchInput } from '@/components/ui/search-input';
// import { getProducts, createProduct, Product } from '@/lib/api/products';
// import { toast } from "sonner"
// import { Loader2, Plus } from 'lucide-react';
// import { handleApiError } from '@/lib/handleError';
// import { cn } from "@/lib/utils";

// export default function ProductManagement() {
//     const [products, setProducts] = React.useState<Product[]>([]);
//     const [loading, setLoading] = React.useState(true);
//     const [search, setSearch] = React.useState('');
//     const [isCreateOpen, setIsCreateOpen] = React.useState(false);
//     const [newProduct, setNewProduct] = React.useState<Partial<Product>>({});
//     const [submitting, setSubmitting] = React.useState(false);

//     // Fetch Products
//     const fetchData = React.useCallback(async (query: string) => {
//         setLoading(true);
//         try {
//             const data = await getProducts(query);
//             setProducts(data);
//         } catch (error) {
//             handleApiError(error);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     React.useEffect(() => {
//         fetchData(search);
//     }, [fetchData, search]);

//     // Handle Create
//     const handleCreate = async () => {
//         if (!newProduct.code || !newProduct.name || !newProduct.price) {
//             toast.error("กรุณากรอกข้อมูลให้ครบถ้วน (รหัส, ชื่อ, ราคา)");
//             return;
//         }

//         setSubmitting(true);
//         try {
//             await createProduct(newProduct);
//             toast.success("บันทึกสินค้าเรียบร้อยแล้ว");
//             setIsCreateOpen(false);
//             setNewProduct({});
//             fetchData(search); // Refresh list
//         } catch (error) {
//             handleApiError(error);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <div className="w-full min-h-screen text-black dark:text-white bg-transparent p-6 space-y-8 animate-in fade-in duration-700">
//             <Card className="shadow-2xl border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
//                 <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-white/10 dark:border-white/5">
//                     <div className="space-y-1">
//                         <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
//                             <span className="p-2.5 bg-blue-500/10 rounded-2xl">📦</span>
//                             คลังข้อมูล <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">สินค้า</span>
//                         </CardTitle>
//                         <p className="text-xs text-slate-500 font-bold italic ml-12">จัดการรายการสินค้าและราคามาตรฐาน</p>
//                     </div>

//                     <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
//                         <DialogTrigger asChild>
//                             <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl transition-all active:scale-95">
//                                 <Plus className="mr-2 h-5 w-5" /> เพิ่มสินค้าใหม่
//                             </Button>
//                         </DialogTrigger>
//                         <DialogContent className="sm:max-w-[450px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-white/20 dark:border-slate-800/50 rounded-[3rem] shadow-2xl p-8">
//                             <DialogHeader className="mb-6">
//                                 <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
//                                     <span className="p-2 bg-blue-500/10 rounded-xl">✨</span>
//                                     ระบุ <span className="text-blue-600">ข้อมูลสินค้า</span>
//                                 </DialogTitle>
//                             </DialogHeader>
//                             <div className="space-y-6">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="code" className="text-xs font-black text-slate-400 uppercase">รหัสสินค้า *</Label>
//                                     <Input
//                                         id="code"
//                                         className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800"
//                                         placeholder="เช่น P001"
//                                         value={newProduct.code || ''}
//                                         onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
//                                     />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase">ชื่อสินค้า *</Label>
//                                     <Input
//                                         id="name"
//                                         className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800"
//                                         placeholder="เช่น หัวปลาแซลมอน"
//                                         value={newProduct.name || ''}
//                                         onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
//                                     />
//                                 </div>
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div className="space-y-2">
//                                         <Label htmlFor="price" className="text-xs font-black text-slate-400 uppercase">ราคา (บาท) *</Label>
//                                         <Input
//                                             id="price"
//                                             type="number"
//                                             className="h-12 rounded-2xl font-black text-blue-600 bg-white dark:bg-slate-800"
//                                             placeholder="0.00"
//                                             value={newProduct.price || ''}
//                                             onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
//                                         />
//                                     </div>
//                                     <div className="space-y-2">
//                                         <Label htmlFor="category" className="text-xs font-black text-slate-400 uppercase">หมวดหมู่</Label>
//                                         <Input
//                                             id="category"
//                                             className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800"
//                                             placeholder="เช่น อาหารแช่แข็ง"
//                                             value={newProduct.category || ''}
//                                             onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                             <DialogFooter className="mt-8 gap-3">
//                                 <DialogClose asChild>
//                                     <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-slate-200">ยกเลิก</Button>
//                                 </DialogClose>
//                                 <Button onClick={handleCreate} disabled={submitting} className="flex-1 h-14 bg-blue-600 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95">
//                                     {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : '💾 บันทึกสินค้า'}
//                                 </Button>
//                             </DialogFooter>
//                         </DialogContent>
//                     </Dialog>
//                 </CardHeader>
//                 <CardContent className="p-8 space-y-8">
//                     {/* Filter / Search */}
//                     <div className="relative max-w-md">
//                         <SearchInput
//                             onSearch={setSearch}
//                             isLoading={loading}
//                             placeholder="ค้นหารหัส หรือ ชื่อสินค้า..."
//                             className="h-14 pl-12 rounded-2xl bg-white/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
//                         />
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl grayscale opacity-50">🔍</span>
//                     </div>

//                     {/* Table */}
//                     <div className="rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-inner bg-white/20">
//                         <Table>
//                             <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
//                                 <TableRow className="border-b dark:border-slate-800 hover:bg-transparent">
//                                     <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 pl-8">รหัส</TableHead>
//                                     <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">ชื่อสินค้า / รายการ</TableHead>
//                                     <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">หมวดหมู่</TableHead>
//                                     <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-right">ราคาจำหน่าย</TableHead>
//                                     <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-center pr-8">สถานะ</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {loading ? (
//                                     <TableRow>
//                                         <TableCell colSpan={5} className="h-64 text-center">
//                                             <div className="flex flex-col items-center gap-3">
//                                                 <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//                                                 <span className="text-sm font-bold text-slate-400 italic">กำลังดึงข้อมูลคลังสินค้า...</span>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ) : products.length > 0 ? (
//                                     products.map((product) => (
//                                         <TableRow key={product.id} className="hover:bg-blue-500/5 transition-colors border-b dark:border-slate-800/50">
//                                             <TableCell className="py-6 pl-8 font-mono text-xs font-black text-slate-400">{product.code}</TableCell>
//                                             <TableCell className="font-black text-slate-900 dark:text-white">{product.name}</TableCell>
//                                             <TableCell>
//                                                 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
//                                                     {product.category || '-'}
//                                                 </span>
//                                             </TableCell>
//                                             <TableCell className="text-right font-black text-blue-600 dark:text-blue-400">
//                                                 {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿
//                                             </TableCell>
//                                             <TableCell className="text-center pr-8">
//                                                 <span className={cn(
//                                                     "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
//                                                     product.status === 'active'
//                                                         ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
//                                                         : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
//                                                 )}>
//                                                     {product.status}
//                                                 </span>
//                                             </TableCell>
//                                         </TableRow>
//                                     ))
//                                 ) : (
//                                     <TableRow>
//                                         <TableCell colSpan={5} className="h-64 text-center py-20 text-slate-400 italic">
//                                             <div className="flex flex-col items-center gap-2">
//                                                 <span className="text-4xl">📦</span>
//                                                 <span className="font-bold">ไม่พบสินค้าในระบบ</span>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 )}
//                             </TableBody>
//                         </Table>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }

