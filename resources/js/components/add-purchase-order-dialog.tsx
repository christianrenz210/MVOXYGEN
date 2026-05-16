import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { router } from '@inertiajs/react';
import AlertModal from '@/components/alert-modal';

interface SupplierProduct {
    id: number;
    supplier_id: number;
    product_name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    unit: string;
    is_active: boolean;
}

interface Supplier {
    id: number;
    name: string;
    products: SupplierProduct[];
}

interface OrderItem {
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    unit: string;
}

interface AddPurchaseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    suppliers: Supplier[];
    nextPoNumber?: string;
}

export default function AddPurchaseOrderDialog({ open, onOpenChange, onSuccess, suppliers, nextPoNumber = '' }: AddPurchaseOrderDialogProps) {
    const [formData, setFormData] = useState({
        supplier_id: '',
        po_number: nextPoNumber,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        payment_method: 'cash_on_delivery',
        notes: ''
    });
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('1');

    // Alert modal state
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setShowAlertModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (orderItems.length === 0) {
            showAlert('Error', 'Please add at least one item to the order.', 'warning');
            return;
        }

        const items = orderItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
        }));

        router.post('/purchase-order', {
            supplier_id: parseInt(formData.supplier_id),
            po_number: formData.po_number,
            order_date: formData.order_date,
            expected_delivery_date: formData.expected_delivery_date,
            payment_method: formData.payment_method,
            notes: formData.notes,
            items: items,
        }, {
            onSuccess: () => {
                onSuccess?.();
                onOpenChange(false);
            },
            onError: (errors) => {
                console.error('Error creating purchase order:', errors);
            }
        });
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Helper to get date 5 days from now
    const getFutureDate = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    // Update form data when dialog opens with new nextPoNumber
    useEffect(() => {
        if (open && nextPoNumber) {
            setFormData({
                supplier_id: '',
                po_number: nextPoNumber,
                order_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: getFutureDate(5),
                payment_method: 'cash_on_delivery',
                notes: ''
            });
        }
    }, [open, nextPoNumber]);

    // Reset when dialog closes
    useEffect(() => {
        if (!open) {
            setFormData({
                supplier_id: '',
                po_number: nextPoNumber,
                order_date: new Date().toISOString().split('T')[0],
                expected_delivery_date: getFutureDate(5),
                payment_method: 'cash_on_delivery',
                notes: ''
            });
            setOrderItems([]);
            setSelectedProduct('');
            setQuantity('1');
        }
    }, [open, nextPoNumber]);

    const getSelectedSupplierProducts = () => {
        const supplier = suppliers.find(s => s.id.toString() === formData.supplier_id);
        return supplier?.products || [];
    };

    const getSelectedProduct = () => {
        const products = getSelectedSupplierProducts();
        return products.find(p => p.id.toString() === selectedProduct);
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleAddItem = () => {
        const product = getSelectedProduct();
        if (!product || !quantity) return;

        const existingItemIndex = orderItems.findIndex(item => item.product_id === product.id);
        
        if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...orderItems];
            updatedItems[existingItemIndex].quantity += parseInt(quantity);
            setOrderItems(updatedItems);
        } else {
            // Add new item
            setOrderItems([...orderItems, {
                product_id: product.id,
                product_name: product.product_name,
                quantity: parseInt(quantity),
                price: product.price,
                unit: product.unit
            }]);
        }

        setSelectedProduct('');
        setQuantity('1');
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Purchase Order</DialogTitle>
                    <DialogDescription>
                        Create a new purchase order from your supplier.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Select value={formData.supplier_id} onValueChange={(value) => {
                                handleInputChange('supplier_id', value);
                                setOrderItems([]); // Clear items when supplier changes
                                setSelectedProduct('');
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                            {supplier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="po_number">PO Number (Auto-generated)</Label>
                            <Input
                                id="po_number"
                                value={formData.po_number}
                                readOnly
                                className="bg-gray-100"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="order_date">Order Date</Label>
                            <div className="relative">
                                <Input
                                    id="order_date"
                                    type="date"
                                    value={formData.order_date}
                                    onChange={(e) => handleInputChange('order_date', e.target.value)}
                                    required
                                    className="pr-10 text-right [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                            <div className="relative">
                                <Input
                                    id="expected_delivery_date"
                                    type="date"
                                    value={formData.expected_delivery_date}
                                    onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                                    required
                                    className="pr-10 text-right [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="gcash">GCash</SelectItem>
                                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Items Section */}
                    <div className="space-y-3 border rounded-md p-4">
                        <Label className="font-semibold">Order Items</Label>
                        
                        {/* Product Selection */}
                        <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-6">
                                <Label htmlFor="product" className="text-sm">Product</Label>
                                <Select 
                                    value={selectedProduct} 
                                    onValueChange={setSelectedProduct}
                                    disabled={!formData.supplier_id || getSelectedSupplierProducts().length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            !formData.supplier_id 
                                                ? "Select supplier first" 
                                                : getSelectedSupplierProducts().length === 0 
                                                    ? "No products available" 
                                                    : "Select product"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getSelectedSupplierProducts().map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.product_name} - ₱{Number(product.price).toFixed(2)} / {product.unit}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-3">
                                <Label htmlFor="item_quantity" className="text-sm">Quantity</Label>
                                <Input
                                    id="item_quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="col-span-3">
                                <Button 
                                    type="button" 
                                    onClick={handleAddItem}
                                    disabled={!selectedProduct || !quantity}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Items List */}
                        {orderItems.length > 0 && (
                            <div className="space-y-2 mt-3">
                                {orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <div className="flex-1">
                                            <span className="font-medium">{item.product_name}</span>
                                            <span className="text-sm text-gray-600 ml-2">
                                                {item.quantity} {item.unit} × ₱{Number(item.price).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">₱{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="font-semibold">Total Amount:</span>
                                    <span className="font-bold text-lg">₱{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Add any additional notes..."
                            rows={2}
                        />
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Purchase Order
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Alert Modal */}
            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </Dialog>
    );
}
