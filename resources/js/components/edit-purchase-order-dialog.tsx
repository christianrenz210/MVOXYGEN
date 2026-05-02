import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Save, X } from 'lucide-react';

interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_name: string;
    supplier_id: number;
    order_date: string;
    expected_delivery_date: string;
    total_amount: number;
    status: 'pending' | 'partial_received' | 'received' | 'cancelled';
    items_count: number;
    received_count: number;
    created_at: string;
    updated_at?: string;
    notes?: string;
}

interface EditPurchaseOrderDialogProps {
    purchaseOrder: PurchaseOrder;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    suppliers?: Array<{ id: number; name: string; }>;
}

export default function EditPurchaseOrderDialog({ purchaseOrder, open, onOpenChange, onSuccess, suppliers = [] }: EditPurchaseOrderDialogProps) {
    const [formData, setFormData] = useState({
        supplier_id: purchaseOrder?.supplier_id?.toString() || '',
        po_number: purchaseOrder?.po_number || '',
        order_date: purchaseOrder?.order_date || '',
        expected_delivery_date: purchaseOrder?.expected_delivery_date || '',
        total_amount: purchaseOrder?.total_amount?.toString() || '0',
        status: purchaseOrder?.status || 'pending',
        notes: purchaseOrder?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Implement purchase order update
        console.log('Updated purchase order data:', formData);
        onSuccess?.();
        onOpenChange(false);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Purchase Order</DialogTitle>
                    <DialogDescription>
                        Update the purchase order information.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange('supplier_id', value)}>
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
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="partial_received">Partial Received</SelectItem>
                                    <SelectItem value="received">Received</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="po_number">PO Number</Label>
                            <Input
                                id="po_number"
                                value={formData.po_number}
                                onChange={(e) => handleInputChange('po_number', e.target.value)}
                                placeholder="PO-001"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="order_date">Order Date</Label>
                            <Input
                                id="order_date"
                                type="date"
                                value={formData.order_date}
                                onChange={(e) => handleInputChange('order_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                            <Input
                                id="expected_delivery_date"
                                type="date"
                                value={formData.expected_delivery_date}
                                onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="total_amount">Total Amount</Label>
                            <Input
                                id="total_amount"
                                type="number"
                                step="0.01"
                                value={formData.total_amount}
                                onChange={(e) => handleInputChange('total_amount', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Add any additional notes..."
                            rows={3}
                        />
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            Update Purchase Order
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
