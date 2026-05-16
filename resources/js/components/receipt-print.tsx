import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, X } from 'lucide-react';

interface ReceiptItem {
    tank_type: string;
    quantity: number;
    price: number;
}

interface ReceiptPrintProps {
    isOpen: boolean;
    onClose: () => void;
    saleData: {
        id?: number;
        customer_name: string;
        payment_method: string;
        total_amount: number;
        cash_amount?: number;
        change?: number;
        items: ReceiptItem[];
        created_at?: string;
    };
}

export default function ReceiptPrint({ isOpen, onClose, saleData }: ReceiptPrintProps) {
    console.log('=== ReceiptPrint component rendered ===');
    console.log('isOpen:', isOpen);
    console.log('saleData:', saleData);

    const handlePrint = () => {
        console.log('=== Print triggered ===');
        
        // Create a hidden iframe for reliable printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            console.error('Failed to get iframe document');
            document.body.removeChild(iframe);
            return;
        }
        
        // Write receipt HTML to iframe
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: 'Courier New', monospace;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 10px;
                        }
                    }
                </style>
            </head>
            <body>
                ${generateReceiptHTML(saleData)}
            </body>
            </html>
        `);
        iframeDoc.close();
        
        // Wait for iframe to load then print
        setTimeout(() => {
            console.log('=== Triggering print from iframe ===');
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (error) {
                console.error('Print error:', error);
            }
            
            // Clean up after printing
            setTimeout(() => {
                document.body.removeChild(iframe);
                console.log('=== Print iframe cleaned up ===');
            }, 1000);
        }, 300);
    };

    // Auto-print on mount when modal opens
    React.useEffect(() => {
        if (isOpen) {
            console.log('=== ReceiptPrint mounted, auto-printing ===');
            const timer = setTimeout(() => {
                handlePrint();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const generateReceiptHTML = (saleData: any) => {
        const subtotal = saleData.items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);
        const total = saleData.total_amount;

        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(amount);
        };

        const formatDate = () => {
            const now = saleData.created_at ? new Date(saleData.created_at) : new Date();
            return now.toLocaleDateString('en-PH') + ' ' + now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
        };

        return `
            <div style="font-family: 'Courier New', monospace; padding: 10px; max-width: 300px; margin: 0 auto; font-size: 11px; line-height: 1.4;">
                <!-- Shop Header -->
                <div style="text-align: center; margin-bottom: 8px;">
                    <div style="font-size: 16px; font-weight: bold; letter-spacing: 2px;">MV OXYGEN</div>
                    <div style="font-size: 10px;">Gas Cylinder Sales & Services</div>
                    <div style="font-size: 9px; margin-top: 2px;">Tel: (02) 8-XXX-XXXX</div>
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- CASH RECEIPT Title -->
                <div style="text-align: center; font-size: 13px; font-weight: bold; letter-spacing: 3px; margin: 8px 0;">
                    CASH RECEIPT
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- Receipt Info -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Receipt #:</span>
                        <span>${saleData.id || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Date:</span>
                        <span>${formatDate()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cashier:</span>
                        <span>${saleData.customer_name}</span>
                    </div>
                </div>

                <div style="text-align: center; margin: 8px 0;">----------------------------------------</div>

                <!-- Column Headers -->
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
                    <span style="flex: 2;">Description</span>
                    <span style="flex: 1; text-align: right;">Qty</span>
                    <span style="flex: 1; text-align: right;">Price</span>
                    <span style="flex: 1; text-align: right;">Amount</span>
                </div>

                <div style="text-align: center; margin: 5px 0;">----------------------------------------</div>

                <!-- Items -->
                <div style="margin-bottom: 8px;">
                    ${saleData.items.map((item: any) => `
                        <div style="margin-bottom: 4px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="flex: 2;">${item.tank_type}</span>
                                <span style="flex: 1; text-align: right;">${item.quantity}</span>
                                <span style="flex: 1; text-align: right;">${formatCurrency(Number(item.price))}</span>
                                <span style="flex: 1; text-align: right;">${formatCurrency(Number(item.price) * item.quantity)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="text-align: center; margin: 8px 0;">----------------------------------------</div>

                <!-- Totals -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="flex: 3;">Subtotal:</span>
                        <span style="flex: 1; text-align: right;">${formatCurrency(subtotal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="flex: 3;">Tax (12%):</span>
                        <span style="flex: 1; text-align: right;">${formatCurrency(subtotal * 0.12)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; margin-top: 4px;">
                        <span style="flex: 3;">TOTAL:</span>
                        <span style="flex: 1; text-align: right;">${formatCurrency(total)}</span>
                    </div>
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- Payment Info -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="flex: 2;">Payment Method:</span>
                        <span style="flex: 1; text-align: right; text-transform: uppercase;">${saleData.payment_method}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="flex: 2;">Cash:</span>
                        <span style="flex: 1; text-align: right;">${formatCurrency(saleData.cash_amount || total)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="flex: 2;">Change:</span>
                        <span style="flex: 1; text-align: right;">${formatCurrency(saleData.change || 0)}</span>
                    </div>
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 10px;">
                    <div style="font-size: 14px; font-weight: bold; letter-spacing: 2px; margin-bottom: 5px;">THANK YOU!</div>
                    <div style="font-size: 9px;">Please come again</div>
                    <div style="font-size: 8px; margin-top: 8px; color: #666;">
                        This serves as your Official Receipt<br>
                        Keep this for warranty purposes
                    </div>
                </div>

                <!-- Barcode representation -->
                <div style="text-align: center; margin-top: 10px; font-family: monospace; font-size: 14px; letter-spacing: 2px;">
                    ||| || ||| || |||| ||| || |||
                </div>
                <div style="text-align: center; font-size: 9px; margin-top: 2px;">
                    ${saleData.id || '000000'}
                </div>
            </div>
        `;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const subtotal = saleData.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const total = saleData.total_amount;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Print Receipt</span>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Receipt Preview - Classic POS Style */}
                    <div id="receipt-content" className="bg-white p-4 border rounded font-mono text-xs" style={{ maxWidth: '320px', margin: '0 auto', lineHeight: '1.4' }}>
                        {/* Shop Header */}
                        <div className="text-center mb-2">
                            <div className="font-bold text-sm tracking-wider">MV OXYGEN</div>
                            <div className="text-[10px]">Gas Cylinder Sales & Services</div>
                            <div className="text-[9px] mt-0.5">Tel: (02) 8-XXX-XXXX</div>
                        </div>

                        <div className="text-center my-2">***************************************</div>

                        {/* CASH RECEIPT Title */}
                        <div className="text-center font-bold text-xs tracking-widest my-2">
                            CASH RECEIPT
                        </div>

                        <div className="text-center my-2">***************************************</div>

                        {/* Receipt Info */}
                        <div className="mb-2">
                            <div className="flex justify-between">
                                <span>Receipt #:</span>
                                <span>{saleData.id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Date:</span>
                                <span>{saleData.created_at 
                                    ? new Date(saleData.created_at).toLocaleDateString('en-PH') + ' ' + new Date(saleData.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
                                    : new Date().toLocaleDateString('en-PH') + ' ' + new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cashier:</span>
                                <span>{saleData.customer_name}</span>
                            </div>
                        </div>

                        <div className="text-center my-2">----------------------------------------</div>

                        {/* Column Headers */}
                        <div className="flex justify-between font-bold mb-1 text-[10px]">
                            <span className="flex-[2]">Description</span>
                            <span className="flex-1 text-right">Qty</span>
                            <span className="flex-1 text-right">Price</span>
                            <span className="flex-1 text-right">Amount</span>
                        </div>

                        <div className="text-center my-1">----------------------------------------</div>

                        {/* Items */}
                        <div className="mb-2">
                            {saleData.items.map((item, index) => (
                                <div key={index} className="mb-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="flex-[2]">{item.tank_type}</span>
                                        <span className="flex-1 text-right">{item.quantity}</span>
                                        <span className="flex-1 text-right">{formatCurrency(Number(item.price))}</span>
                                        <span className="flex-1 text-right">{formatCurrency(Number(item.price) * item.quantity)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center my-2">----------------------------------------</div>

                        {/* Totals */}
                        <div className="mb-2">
                            <div className="flex justify-between">
                                <span className="flex-[3]">Subtotal:</span>
                                <span className="flex-1 text-right">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex-[3]">Tax (12%):</span>
                                <span className="flex-1 text-right">{formatCurrency(subtotal * 0.12)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xs mt-1">
                                <span className="flex-[3]">TOTAL:</span>
                                <span className="flex-1 text-right">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <div className="text-center my-2">***************************************</div>

                        {/* Payment Info */}
                        <div className="mb-2">
                            <div className="flex justify-between">
                                <span className="flex-[2]">Payment Method:</span>
                                <span className="flex-1 text-right uppercase">{saleData.payment_method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex-[2]">Cash:</span>
                                <span className="flex-1 text-right">{formatCurrency(saleData.cash_amount || total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex-[2]">Change:</span>
                                <span className="flex-1 text-right">{formatCurrency(saleData.change || 0)}</span>
                            </div>
                        </div>

                        <div className="text-center my-2">***************************************</div>

                        {/* Footer */}
                        <div className="text-center mt-3">
                            <div className="font-bold text-sm tracking-wider mb-1">THANK YOU!</div>
                            <div className="text-[9px]">Please come again</div>
                            <div className="text-[8px] mt-2 text-gray-500">
                                This serves as your Official Receipt<br />
                                Keep this for warranty purposes
                            </div>
                        </div>

                        {/* Barcode representation */}
                        <div className="text-center mt-3 font-mono text-sm tracking-widest">
                            ||| || ||| || |||| ||| || |||
                        </div>
                        <div className="text-center text-[9px] mt-0.5">
                            {saleData.id || '000000'}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} className="flex-1">
                            <Printer className="h-4 w-4 mr-2" />
                            Print Receipt
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
