import { Head, router } from '@inertiajs/react';
import SupplierLayout from '@/layouts/supplier-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Boxes, Package, Plus, Edit, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface SupplierProduct {
    id: number;
    product_name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    unit: string;
    is_active: boolean;
}

interface SupplierProductsProps {
    products: SupplierProduct[];
    supplier: {
        id: number;
        name: string;
    };
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    success?: string;
}

export default function SupplierProducts({ products, supplier, success }: SupplierProductsProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<SupplierProduct | null>(null);

    const [formData, setFormData] = useState({
        product_name: '',
        description: '',
        price: '',
        stock_quantity: '',
        unit: 'pcs',
    });

    const getStatusBadge = (product: SupplierProduct) => {
        if (!product.is_active) {
            return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
        }
        if (product.stock_quantity === 0) {
            return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
        }
        if (product.stock_quantity <= 10) {
            return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/supplier/products', {
            product_name: formData.product_name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity),
            unit: formData.unit,
        }, {
            onSuccess: () => {
                setShowAddDialog(false);
                setFormData({ product_name: '', description: '', price: '', stock_quantity: '', unit: 'pcs' });
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        router.put(`/supplier/products/${selectedProduct.id}`, {
            product_name: formData.product_name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity),
            unit: formData.unit,
            is_active: selectedProduct.is_active,
        }, {
            onSuccess: () => {
                setShowEditDialog(false);
                setSelectedProduct(null);
            }
        });
    };

    const handleDelete = () => {
        if (!selectedProduct) return;

        router.delete(`/supplier/products/${selectedProduct.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedProduct(null);
            }
        });
    };

    const openEditDialog = (product: SupplierProduct) => {
        setSelectedProduct(product);
        setFormData({
            product_name: product.product_name,
            description: product.description || '',
            price: product.price.toString(),
            stock_quantity: product.stock_quantity.toString(),
            unit: product.unit,
        });
        setShowEditDialog(true);
    };

    const openDeleteDialog = (product: SupplierProduct) => {
        setSelectedProduct(product);
        setShowDeleteDialog(true);
    };

    return (
        <SupplierLayout>
            <Head title="Products" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                        {success}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground">
                            Manage your available products and inventory
                        </p>
                    </div>
                    <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                {/* Stats Card */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Boxes className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{products.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <Package className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {products.filter(p => p.is_active && p.stock_quantity > 0).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low/Out of Stock</CardTitle>
                            <Package className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {products.filter(p => p.is_active && p.stock_quantity <= 10).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">
                                                    {product.product_name}
                                                </TableCell>
                                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                                <TableCell>{product.stock_quantity}</TableCell>
                                                <TableCell>{product.unit}</TableCell>
                                                <TableCell>
                                                    {getStatusBadge(product)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditDialog(product)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openDeleteDialog(product)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No products found. Click "Add Product" to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Product Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>
                            Add a new product to your inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="product_name">Product Name</Label>
                            <Input
                                id="product_name"
                                value={formData.product_name}
                                onChange={(e) => handleInputChange('product_name', e.target.value)}
                                placeholder="e.g., Oxygen Tank 5kg"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Product description"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (PHP)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                                <Input
                                    id="stock_quantity"
                                    type="number"
                                    min="0"
                                    value={formData.stock_quantity}
                                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                value={formData.unit}
                                onChange={(e) => handleInputChange('unit', e.target.value)}
                                placeholder="e.g., pcs, kg, liters"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_product_name">Product Name</Label>
                            <Input
                                id="edit_product_name"
                                value={formData.product_name}
                                onChange={(e) => handleInputChange('product_name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_description">Description</Label>
                            <Input
                                id="edit_description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_price">Price (PHP)</Label>
                                <Input
                                    id="edit_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_stock_quantity">Stock Quantity</Label>
                                <Input
                                    id="edit_stock_quantity"
                                    type="number"
                                    min="0"
                                    value={formData.stock_quantity}
                                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit_unit">Unit</Label>
                            <Input
                                id="edit_unit"
                                value={formData.unit}
                                onChange={(e) => handleInputChange('unit', e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                <Edit className="h-4 w-4 mr-2" />
                                Update Product
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedProduct?.product_name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SupplierLayout>
    );
}
