import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, AlertCircle } from 'lucide-react';

interface PurchaseOrderItem {
    id: number;
    product_name: string;
    quantity: number;
    received_quantity: number;
    price: number;
    total: number;
}

interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_name: string;
    status: string;
    payment_status?: string;
    total_amount: number;
    items?: PurchaseOrderItem[];
}

interface PartialReceiveDialogProps {
    purchaseOrder: PurchaseOrder | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PartialReceiveDialog({ purchaseOrder, open, onOpenChange }: PartialReceiveDialogProps) {
    const [receivedQuantities, setReceivedQuantities] = useState<Record<number, number>>({});
    const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'partial_paid' | 'paid'>('unpaid');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (purchaseOrder?.items) {
            const initial: Record<number, number> = {};
            purchaseOrder.items.forEach((item) => {
                initial[item.id] = 0;
            });
            setReceivedQuantities(initial);
            setPaymentStatus((purchaseOrder.payment_status as any) || 'unpaid');
            setError(null);
        }
    }, [purchaseOrder, open]);

    if (!purchaseOrder) return null;

    const items = purchaseOrder.items || [];

    const handleQuantityChange = (itemId: number, value: string, max: number) => {
        const num = parseInt(value) || 0;
        const clamped = Math.max(0, Math.min(num, max));
        setReceivedQuantities((prev) => ({ ...prev, [itemId]: clamped }));
    };

    const totalToReceive = Object.values(receivedQuantities).reduce((a, b) => a + b, 0);

    const handleSubmit = () => {
        setError(null);

        if (totalToReceive === 0) {
            setError('Please enter at least one quantity to receive.');
            return;
        }

        const itemsPayload = items
            .filter((item) => (receivedQuantities[item.id] || 0) > 0)
            .map((item) => ({
                item_id: item.id,
                received_quantity: receivedQuantities[item.id] || 0,
            }));

        if (itemsPayload.length === 0) {
            setError('No quantities entered.');
            return;
        }

        setSubmitting(true);
        router.post(
            `/purchase-order/${purchaseOrder.id}/receive`,
            {
                items: itemsPayload,
                payment_status: paymentStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitting(false);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setSubmitting(false);
                    setError(Object.values(errors).join(' ') || 'Failed to receive items.');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Partial Receive — {purchaseOrder.po_number}
                    </DialogTitle>
                    <DialogDescription>
                        Enter the quantity of each item received. Items will be added to inventory.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-muted-foreground">Supplier: </span>
                                <span className="font-medium">{purchaseOrder.supplier_name}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Status: </span>
                                <span className="font-medium capitalize">{purchaseOrder.status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Items to Receive</h4>
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No items found for this order.</p>
                        ) : (
                            items.map((item) => {
                                const remaining = item.quantity - item.received_quantity;
                                const fullyReceived = remaining <= 0;
                                return (
                                    <div
                                        key={item.id}
                                        className={`rounded-lg border p-3 space-y-2 ${fullyReceived ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{item.product_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Ordered: {item.quantity} • Already Received: {item.received_quantity} • Remaining:{' '}
                                                    <span className={remaining > 0 ? 'text-blue-600 font-semibold' : 'text-green-600'}>
                                                        {remaining}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">Unit Price</div>
                                                <div className="text-sm font-medium">₱{item.price.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {!fullyReceived && (
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs whitespace-nowrap">Receive Now:</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={remaining}
                                                    value={receivedQuantities[item.id] ?? 0}
                                                    onChange={(e) => handleQuantityChange(item.id, e.target.value, remaining)}
                                                    className="h-8 max-w-[100px]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityChange(item.id, String(remaining), remaining)}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Receive All ({remaining})
                                                </button>
                                            </div>
                                        )}

                                        {fullyReceived && (
                                            <div className="text-xs text-green-700 font-medium">✓ Fully Received</div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-2">
                        <Label>Payment Status</Label>
                        <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="partial_paid">Partial Paid</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Summary */}
                    <div className="rounded-md border bg-blue-50 border-blue-200 p-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-blue-900">Total Items to Receive Now:</span>
                            <span className="text-lg font-bold text-blue-700">{totalToReceive}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 flex gap-2 items-start">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || totalToReceive === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {submitting ? 'Processing...' : `Receive ${totalToReceive} Item${totalToReceive !== 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
