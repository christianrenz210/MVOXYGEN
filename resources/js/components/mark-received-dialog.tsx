import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle, DollarSign, Truck, Banknote } from 'lucide-react';

interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier_name: string;
    total_amount: number;
    status: string;
    payment_method?: string;
    payment_status?: string;
    items_count: number;
    received_count: number;
}

interface MarkReceivedDialogProps {
    purchaseOrder: PurchaseOrder | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function MarkReceivedDialog({ purchaseOrder, open, onOpenChange }: MarkReceivedDialogProps) {
    const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'partial_paid' | 'paid'>('unpaid');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (purchaseOrder) {
            // For COD, default to "paid" since cashier collects upon delivery
            const isCOD = purchaseOrder.payment_method === 'cash_on_delivery';
            setPaymentStatus(isCOD ? 'paid' : (purchaseOrder.payment_status as any) || 'unpaid');
            setError(null);
        }
    }, [purchaseOrder, open]);

    if (!purchaseOrder) return null;

    const isCOD = purchaseOrder.payment_method === 'cash_on_delivery';
    const remaining = purchaseOrder.items_count - purchaseOrder.received_count;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount);

    const formatPaymentMethod = (method?: string) => {
        if (!method) return 'N/A';
        return method
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const handleSubmit = () => {
        setError(null);
        setSubmitting(true);
        router.post(
            `/purchase-order/${purchaseOrder.id}/mark-received`,
            { payment_status: paymentStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitting(false);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setSubmitting(false);
                    setError(Object.values(errors).join(' ') || 'Failed to mark order as received.');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Mark as Fully Received
                    </DialogTitle>
                    <DialogDescription>
                        Confirm the order is fully received{isCOD ? ' and record the cash payment' : ''}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">PO Number:</span>
                            <span className="text-sm font-medium">{purchaseOrder.po_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Supplier:</span>
                            <span className="text-sm font-medium">{purchaseOrder.supplier_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Items to Receive:</span>
                            <span className="text-sm font-medium">{remaining} of {purchaseOrder.items_count}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-sm font-semibold">Total Amount:</span>
                            <span className="text-base font-bold text-green-700">{formatCurrency(purchaseOrder.total_amount)}</span>
                        </div>
                    </div>

                    {/* Payment Method Highlight */}
                    <div className={`rounded-lg border p-4 flex items-start gap-3 ${isCOD ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                        {isCOD ? (
                            <Banknote className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        ) : (
                            <Truck className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                                Payment Method: {formatPaymentMethod(purchaseOrder.payment_method)}
                            </p>
                            {isCOD ? (
                                <p className="text-xs text-orange-700 mt-1">
                                    💵 This is a Cash on Delivery order. Please collect <strong>{formatCurrency(purchaseOrder.total_amount)}</strong> from the supplier and record the payment status below.
                                </p>
                            ) : (
                                <p className="text-xs text-gray-600 mt-1">
                                    Update the payment status if needed.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4" />
                            Payment Status {isCOD && <span className="text-red-500">*</span>}
                        </Label>
                        <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as any)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        Paid
                                    </div>
                                </SelectItem>
                                <SelectItem value="partial_paid">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                        Partial Paid
                                    </div>
                                </SelectItem>
                                <SelectItem value="unpaid">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        Unpaid
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {isCOD && paymentStatus !== 'paid' && (
                            <p className="text-xs text-orange-700 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Note: COD orders are usually marked as Paid upon delivery.
                            </p>
                        )}
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
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {submitting ? 'Processing...' : 'Confirm & Mark Received'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
