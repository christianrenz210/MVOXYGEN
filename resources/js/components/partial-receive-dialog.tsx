import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, AlertCircle, Banknote, Smartphone } from 'lucide-react';

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
    const [partialAmount, setPartialAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
    const [gcashReferenceNumber, setGcashReferenceNumber] = useState('');
    const [gcashPhoneNumber, setGcashPhoneNumber] = useState('');
    const [gcashPaymentTime, setGcashPaymentTime] = useState('');
    const [gcashPaymentConfirmed, setGcashPaymentConfirmed] = useState(false);
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
            setPartialAmount('');
            setPaymentMethod('cash');
            setGcashReferenceNumber('');
            setGcashPhoneNumber('');
            setGcashPaymentTime('');
            setGcashPaymentConfirmed(false);
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

    // Compute total value of items being received now
    const totalReceivingValue = items.reduce((sum, item) => {
        const qty = receivedQuantities[item.id] ?? 0;
        return sum + qty * item.price;
    }, 0);

    // Per-item partial paid breakdown (proportional to item value)
    const getItemPartialPaid = (item: PurchaseOrderItem): number => {
        const partial = parseFloat(partialAmount) || 0;
        if (partial <= 0 || totalReceivingValue <= 0) return 0;
        const qty = receivedQuantities[item.id] ?? 0;
        const itemValue = qty * item.price;
        return Math.round((itemValue / totalReceivingValue) * partial * 100) / 100;
    };

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

        if (paymentStatus === 'partial_paid') {
            const partial = parseFloat(partialAmount) || 0;
            if (partial <= 0) {
                setError('Please enter the partial amount paid.');
                return;
            }
        }

        if (paymentStatus === 'paid') {
            const paid = parseFloat(partialAmount) || 0;
            if (paid <= 0) {
                setError('Please enter the amount paid.');
                return;
            }
            if (paid < totalReceivingValue) {
                setError(`Amount paid (₱${paid.toFixed(2)}) is less than the total (₱${totalReceivingValue.toFixed(2)}). Please enter the full amount or choose "Partial Paid" instead.`);
                return;
            }
        }

        if (paymentMethod === 'gcash' && paymentStatus !== 'unpaid') {
            if (!gcashReferenceNumber.trim()) {
                setError('Please enter the GCash reference number.');
                return;
            }
            if (!gcashPhoneNumber.trim()) {
                setError('Please enter the supplier\'s GCash phone number.');
                return;
            }
            if (!gcashPaymentTime.trim()) {
                setError('Please enter the payment time.');
                return;
            }
            if (!gcashPaymentConfirmed) {
                setError('Please confirm that the GCash payment has been received.');
                return;
            }
        }

        setSubmitting(true);
        router.post(
            `/purchase-order/${purchaseOrder.id}/receive`,
            {
                items: itemsPayload,
                payment_status: paymentStatus,
                payment_method: paymentStatus !== 'unpaid' ? paymentMethod : null,
                partial_amount: paymentStatus === 'partial_paid' ? parseFloat(partialAmount) || 0 : null,
                gcash_reference: paymentMethod === 'gcash' ? gcashReferenceNumber : null,
                gcash_phone: paymentMethod === 'gcash' ? gcashPhoneNumber : null,
                gcash_time: paymentMethod === 'gcash' ? gcashPaymentTime : null,
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
                        <Select value={paymentStatus} onValueChange={(v) => {
                            setPaymentStatus(v as any);
                            if (v === 'paid') {
                                // Auto-fill with full total
                                setPartialAmount(String(totalReceivingValue));
                            } else {
                                setPartialAmount('');
                            }
                        }}>
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

                    {/* Amount Input (shown for partial_paid and paid) */}
                    {(paymentStatus === 'partial_paid' || paymentStatus === 'paid') && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label>Amount Paid</Label>
                                <div className="relative max-w-[200px]">
                                    <span className="absolute left-3 top-2 text-sm text-muted-foreground">₱</span>
                                    <Input
                                        type="number"
                                        min={paymentStatus === 'paid' ? totalReceivingValue : 0.01}
                                        max={999999.99}
                                        step={0.01}
                                        value={partialAmount}
                                        onChange={(e) => {
                                            const raw = parseFloat(e.target.value);
                                            if (isNaN(raw)) {
                                                setPartialAmount('');
                                                return;
                                            }
                                            // Cap at 999,999.99 to prevent scientific notation
                                            const capped = Math.min(raw, 999999.99);
                                            setPartialAmount(String(capped));
                                        }}
                                        className="pl-7 h-9"
                                        placeholder="0.00"
                                    />
                                </div>
                                {paymentStatus === 'paid' && (parseFloat(partialAmount) || 0) > 0 && (parseFloat(partialAmount) || 0) < totalReceivingValue && (
                                    <p className="text-xs text-red-600 font-medium">
                                        ⚠ Amount is less than total (₱{totalReceivingValue.toFixed(2)}). Use "Partial Paid" for partial payments.
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Total value of items being received: ₱{totalReceivingValue.toFixed(2)}
                                </p>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-1">
                                <Label>Payment Method</Label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                                            paymentMethod === 'cash'
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        <Banknote className="h-4 w-4" />
                                        Cash
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('gcash')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                                            paymentMethod === 'gcash'
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        <Smartphone className="h-4 w-4" />
                                        GCash
                                    </button>
                                </div>

                                {/* GCash Verification */}
                                {paymentMethod === 'gcash' && (paymentStatus === 'paid' || paymentStatus === 'partial_paid') && (
                                    <div className="mt-3 w-full space-y-4">
                                        {/* Steps */}
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                            <p className="text-sm text-yellow-800 text-center font-semibold mb-2">
                                                🔒 SECURITY VERIFICATION REQUIRED
                                            </p>
                                            <p className="text-sm text-yellow-800 text-center">
                                                <strong>Step 1:</strong> Supplier scans QR code with GCash app
                                            </p>
                                            <p className="text-sm text-yellow-800 text-center mt-1">
                                                <strong>Step 2:</strong> Verify payment details match (Amount: ₱{(parseFloat(partialAmount) || 0).toFixed(2)})
                                            </p>
                                            <p className="text-sm text-yellow-800 text-center mt-1">
                                                <strong>Step 3:</strong> Check supplier's GCash app for "Payment Successful"
                                            </p>
                                            <p className="text-sm text-yellow-800 text-center mt-1">
                                                <strong>Step 4:</strong> Record payment details below for audit trail
                                            </p>
                                        </div>

                                        {/* Verification Fields */}
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                                            <h5 className="text-sm font-semibold text-red-800">📋 PAYMENT VERIFICATION DETAILS</h5>

                                            <div>
                                                <label className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded">GCash Reference Number *</label>
                                                <Input
                                                    type="text"
                                                    maxLength={13}
                                                    placeholder="13-digit reference number"
                                                    value={gcashReferenceNumber}
                                                    onChange={(e) => setGcashReferenceNumber(e.target.value.replace(/\D/g, ''))}
                                                    className={`mt-1 bg-red-50 ${gcashReferenceNumber && !/^\d{13}$/.test(gcashReferenceNumber) ? 'border-red-500 ring-1 ring-red-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500'}`}
                                                />
                                                {gcashReferenceNumber && !/^\d{13}$/.test(gcashReferenceNumber) && (
                                                    <p className="text-xs text-red-600 mt-1 font-medium">Must be exactly 13 digits</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded">Supplier Phone Number *</label>
                                                <Input
                                                    type="text"
                                                    maxLength={11}
                                                    placeholder="09XXXXXXXXX"
                                                    value={gcashPhoneNumber}
                                                    onChange={(e) => setGcashPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                                    className={`mt-1 bg-red-50 ${gcashPhoneNumber && !/^09\d{9}$/.test(gcashPhoneNumber) ? 'border-red-500 ring-1 ring-red-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500'}`}
                                                />
                                                {gcashPhoneNumber && !/^09\d{9}$/.test(gcashPhoneNumber) && (
                                                    <p className="text-xs text-red-600 mt-1 font-medium">Must be 11 digits starting with 09</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded">Payment Time *</label>
                                                <Input
                                                    type="time"
                                                    value={gcashPaymentTime}
                                                    onChange={(e) => setGcashPaymentTime(e.target.value)}
                                                    className="mt-1 border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                                                />
                                            </div>
                                        </div>

                                        {/* Confirmation Checkbox */}
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-start space-x-3">
                                                <input
                                                    type="checkbox"
                                                    id="gcashConfirm"
                                                    checked={gcashPaymentConfirmed}
                                                    onChange={(e) => setGcashPaymentConfirmed(e.target.checked)}
                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                                                />
                                                <div>
                                                    <label htmlFor="gcashConfirm" className="text-sm font-medium text-green-800">
                                                        I confirm that:
                                                    </label>
                                                    <ul className="text-xs text-green-700 mt-1 space-y-1">
                                                        <li>• Supplier has successfully received ₱{(parseFloat(partialAmount) || 0).toFixed(2)} via GCash</li>
                                                        <li>• I have verified the payment on supplier's GCash app</li>
                                                        <li>• All payment details above are accurate and complete</li>
                                                        <li>• I understand this action cannot be undone</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Per-item breakdown — only for partial_paid */}
                            {paymentStatus === 'partial_paid' && (parseFloat(partialAmount) || 0) > 0 && totalReceivingValue > 0 && (
                                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 space-y-2">
                                    <p className="text-xs font-semibold text-yellow-800">Partial Payment Breakdown per Item:</p>
                                    {items
                                        .filter((item) => (receivedQuantities[item.id] ?? 0) > 0)
                                        .map((item) => {
                                            const itemPartial = getItemPartialPaid(item);
                                            const itemValue = (receivedQuantities[item.id] ?? 0) * item.price;
                                            const remaining = itemValue - itemPartial;
                                            return (
                                                <div key={item.id} className="text-xs flex justify-between items-center border-b border-yellow-100 pb-1 last:border-0 last:pb-0">
                                                    <span className="text-yellow-900 font-medium">{item.product_name}</span>
                                                    <div className="text-right space-y-0.5">
                                                        <div className="text-green-700">Paid: ₱{Math.min(itemPartial, itemValue).toFixed(2)}</div>
                                                        <div className="text-red-600">Balance: ₱{Math.max(0, remaining).toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                    <div className="flex justify-between text-xs font-semibold pt-1 border-t border-yellow-200">
                                        {(parseFloat(partialAmount) || 0) >= totalReceivingValue ? (
                                            <>
                                                <span className="text-yellow-900">Remaining Balance:</span>
                                                <span className="text-green-600">₱0.00 (Fully Paid)</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-yellow-900">Remaining Balance:</span>
                                                <span className="text-red-600">₱{Math.max(0, totalReceivingValue - (parseFloat(partialAmount) || 0)).toFixed(2)}</span>
                                            </>
                                        )}
                                    </div>
                                    {(parseFloat(partialAmount) || 0) > totalReceivingValue && (
                                        <div className="flex justify-between text-xs font-semibold border-t border-yellow-200 pt-1">
                                            <span className="text-green-700">Change:</span>
                                            <span className="text-green-600">₱{((parseFloat(partialAmount) || 0) - totalReceivingValue).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary */}
                    <div className="rounded-md border bg-blue-50 border-blue-200 p-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-blue-900">Total Items to Receive Now:</span>
                            <span className="text-lg font-bold text-blue-700">{totalToReceive}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-blue-900">Total Amount:</span>
                            <span className="font-semibold text-blue-700">₱{totalReceivingValue.toFixed(2)}</span>
                        </div>
                        {paymentStatus === 'partial_paid' && (
                            <>
                                <div className="flex justify-between items-center text-sm border-t border-blue-200 pt-2">
                                    <span className="font-medium text-green-700">Partial Paid:</span>
                                    <span className="font-semibold text-green-600">
                                        ₱{(parseFloat(partialAmount) || 0).toFixed(2)}
                                    </span>
                                </div>
                                {(parseFloat(partialAmount) || 0) > totalReceivingValue ? (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-green-700">Remaining Balance:</span>
                                            <span className="font-bold text-green-600">₱0.00 (Fully Paid)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-green-700">Change:</span>
                                            <span className="font-bold text-green-600">
                                                ₱{((parseFloat(partialAmount) || 0) - totalReceivingValue).toFixed(2)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-red-700">Remaining Balance:</span>
                                        <span className="font-bold text-red-600">
                                            ₱{Math.max(0, totalReceivingValue - (parseFloat(partialAmount) || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                        {paymentStatus === 'paid' && (
                            <>
                                <div className="flex justify-between items-center text-sm border-t border-blue-200 pt-2">
                                    <span className="font-medium text-green-700">Amount Paid:</span>
                                    <span className="font-semibold text-green-600">
                                        ₱{(parseFloat(partialAmount) || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-blue-900">Remaining Balance:</span>
                                    {(parseFloat(partialAmount) || 0) >= totalReceivingValue ? (
                                        <span className="font-bold text-green-600">₱0.00</span>
                                    ) : (
                                        <span className="font-bold text-red-600">₱{Math.max(0, totalReceivingValue - (parseFloat(partialAmount) || 0)).toFixed(2)}</span>
                                    )}
                                </div>
                                {(parseFloat(partialAmount) || 0) > totalReceivingValue && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-green-700">Change:</span>
                                        <span className="font-bold text-green-600">
                                            ₱{((parseFloat(partialAmount) || 0) - totalReceivingValue).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm">
                                    {(parseFloat(partialAmount) || 0) >= totalReceivingValue ? (
                                        <>
                                            <span className="font-medium text-green-700">Status:</span>
                                            <span className="font-bold text-green-600">Fully Paid ✓</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium text-red-700">Status:</span>
                                            <span className="font-bold text-red-600">Insufficient Payment</span>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                        {paymentStatus === 'unpaid' && (
                            <div className="flex justify-between items-center text-sm border-t border-blue-200 pt-2">
                                <span className="font-medium text-red-700">Balance Due:</span>
                                <span className="font-bold text-red-600">₱{totalReceivingValue.toFixed(2)}</span>
                            </div>
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
                        disabled={
                            submitting ||
                            totalToReceive === 0 ||
                            (paymentStatus === 'partial_paid' && (parseFloat(partialAmount) || 0) <= 0) ||
                            (paymentStatus === 'paid' && (parseFloat(partialAmount) || 0) < totalReceivingValue) ||
                            (paymentMethod === 'gcash' && paymentStatus !== 'unpaid' && (
                                !/^\d{13}$/.test(gcashReferenceNumber) ||
                                !/^09\d{9}$/.test(gcashPhoneNumber) ||
                                !gcashPaymentTime.trim() ||
                                !gcashPaymentConfirmed
                            ))
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {submitting ? 'Processing...' : `Receive ${totalToReceive} Item${totalToReceive !== 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
