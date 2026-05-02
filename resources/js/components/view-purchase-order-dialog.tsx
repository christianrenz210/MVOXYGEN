import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Package, DollarSign, CheckCircle, Clock, AlertCircle, Building2, Truck, Edit } from 'lucide-react';

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

interface ViewPurchaseOrderDialogProps {
    purchaseOrder: PurchaseOrder;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ViewPurchaseOrderDialog({ purchaseOrder, open, onOpenChange }: ViewPurchaseOrderDialogProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'partial_received':
                return <Badge className="bg-blue-100 text-blue-800">Partial Received</Badge>;
            case 'received':
                return <Badge className="bg-green-100 text-green-800">Received</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Purchase Order Details
                    </DialogTitle>
                    <DialogDescription>
                        View detailed information about this purchase order.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* PO Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">PO Information</h4>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">PO Number:</span>
                                    <span className="text-sm font-medium">{purchaseOrder.po_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <div>{getStatusBadge(purchaseOrder.status)}</div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Progress:</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${(purchaseOrder.received_count / purchaseOrder.items_count) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {purchaseOrder.received_count}/{purchaseOrder.items_count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Dates</h4>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Order Date:</span>
                                    <span className="text-sm font-medium">
                                        {new Date(purchaseOrder.order_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Expected Delivery:</span>
                                    <span className="text-sm font-medium">
                                        {new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Created:</span>
                                    <span className="text-sm font-medium">
                                        {new Date(purchaseOrder.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Supplier Information */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Supplier Information</h4>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{purchaseOrder.supplier_name}</div>
                                <div className="text-sm text-muted-foreground">Supplier ID: #{purchaseOrder.supplier_id}</div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Financial Information</h4>
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">{formatCurrency(purchaseOrder.total_amount)}</div>
                                <div className="text-sm text-muted-foreground">Total Amount</div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {purchaseOrder.notes && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">{purchaseOrder.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
