import { Head, router, usePage } from '@inertiajs/react';
import CashierLayout from '@/layouts/cashier-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, ShoppingCart, Plus, Minus, Trash2, DollarSign, Receipt, ChevronLeft, Package, QrCode, FileText, Printer, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReceiptPrint from '@/components/receipt-print';
import AlertModal from '@/components/alert-modal';
import EndShiftReport from '@/components/end-shift-report';

interface Tank {
    id: number;
    tank_type: string;
    quantity: number;
    price: number;
    status: string;
    image?: string;
}

interface CartItem {
    tank: Tank;
    quantity: number;
}

export default function CashierIndex({ tanks }: { tanks: Tank[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cashAmount, setCashAmount] = useState<string>('');
    const [cashWarning, setCashWarning] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showQRCode, setShowQRCode] = useState(false);
    const [gcashQRCode, setGcashQRCode] = useState<string>('');
    const [gcashPaymentConfirmed, setGcashPaymentConfirmed] = useState(false);
    const [gcashReferenceNumber, setGcashReferenceNumber] = useState('');
    const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');
    const [paymentTimestamp, setPaymentTimestamp] = useState('');
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSaleData, setLastSaleData] = useState<any>(null);
    const [showEndShiftReport, setShowEndShiftReport] = useState(false);
    const [endShiftData, setEndShiftData] = useState<any>(null);

    // Alert modal state
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    const getChange = () => {
        const cash = parseFloat(cashAmount) || 0;
        const total = getTotalAmount();
        return Math.max(0, cash - total);
    };

    const showGCashQR = () => {
        setShowQRCode(true);
    };

    // Listen for flash messages from Inertia shared props
    const page = usePage();
    const flashSuccess = (page.props as any).flash?.success as string | undefined;
    const flashError = (page.props as any).flash?.error as string | undefined;

    useEffect(() => {
        if (flashSuccess) {
            // Extract sale ID from flash message (e.g., "Sale #123 processed successfully!")
            const saleIdMatch = flashSuccess.match(/Sale #(\d+)/);
            const saleId = saleIdMatch ? parseInt(saleIdMatch[1]) : undefined;
        }
        if (flashError) {
            showAlert('Error', flashError, 'error');
        }
    }, [flashSuccess, flashError]);

    // Check cash warning when cart or cash amount changes
    useEffect(() => {
        if (paymentMethod === 'cash' && cashAmount) {
            const cash = parseFloat(cashAmount) || 0;
            const total = getTotalAmount();
            if (cash < total) {
                setCashWarning(`Insufficient cash! Need ₱${(total - cash).toFixed(2)} more`);
            } else {
                setCashWarning('');
            }
        }
    }, [cart, paymentMethod, cashAmount]);

    const addToCart = (tank: Tank) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.tank.id === tank.id);
            if (existingItem) {
                if (existingItem.quantity < tank.quantity) {
                    return prevCart.map(item =>
                        item.tank.id === tank.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return prevCart;
            }
            return [...prevCart, { tank, quantity: 1 }];
        });
    };

    const updateQuantity = (tankId: number, quantity: number) => {
        setCart(prevCart => {
            const item = prevCart.find(item => item.tank.id === tankId);
            if (!item) return prevCart;
            
            if (quantity <= 0) {
                return prevCart.filter(item => item.tank.id !== tankId);
            }
            
            if (quantity <= item.tank.quantity) {
                return prevCart.map(item =>
                    item.tank.id === tankId
                        ? { ...item, quantity }
                        : item
                );
            }
            return prevCart;
        });
    };

    const removeFromCart = (tankId: number) => {
        setCart(prevCart => prevCart.filter(item => item.tank.id !== tankId));
    };

    const getSubtotal = () => {
        return cart.reduce((total, item) => total + (Number(item.tank.price) * item.quantity), 0);
    };

    const getTax = () => {
        const subtotal = getSubtotal();
        return subtotal * 0.12; // 12% tax
    };

    const getTotalAmount = () => {
        const subtotal = getSubtotal();
        const tax = getTax();
        return subtotal + tax;
    };

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ title, message, type });
        setShowAlertModal(true);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const printReceiptDirectly = (saleData: any) => {
        try {
            const printElement = document.createElement('div');
            printElement.id = 'print-receipt';
            const receiptHTML = generateReceiptHTML(saleData);
            printElement.innerHTML = receiptHTML;
            printElement.style.position = 'absolute';
            printElement.style.left = '-9999px';
            printElement.style.top = '-9999px';
            document.body.appendChild(printElement);

            const printStyles = document.createElement('style');
            printStyles.innerHTML = `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-receipt, #print-receipt * {
                        visibility: visible;
                    }
                    #print-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(printStyles);

            if (typeof window.print === 'function') {
                window.print();
            } else {
                showAlert('Error', 'Print function is not available in this browser', 'error');
            }
            
            // Clean up after printing
            setTimeout(() => {
                if (document.getElementById('print-receipt')) {
                    document.body.removeChild(printElement);
                }
                if (printStyles.parentNode) {
                    document.head.removeChild(printStyles);
                }
            }, 500);
        } catch (error) {
            showAlert('Error', 'Print error: ' + (error as Error).message, 'error');
        }
    };

    const generateReceiptHTML = (saleData: any) => {
        const subtotal = saleData.items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);
        const tax = subtotal * 0.12;
        const total = saleData.total_amount;

        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(amount);
        };

        return `
            <div style="font-family: 'Courier New', monospace; padding: 15px; max-width: 280px; margin: 0 auto; font-size: 12px;">
                <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
                    <div style="font-size: 14px;">MV OXYGEN TRADING</div>
                    <div>Gas Cylinder Sales & Services</div>
                </div>

                <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Receipt #:</span>
                        <span>${saleData.id || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Date:</span>
                        <span>${saleData.created_at ? new Date(saleData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Customer:</span>
                        <span>${saleData.customer_name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Payment:</span>
                        <span style="text-transform: capitalize;">${saleData.payment_method}</span>
                    </div>
                </div>

                <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

                <div style="margin-bottom: 10px;">
                    ${saleData.items.map((item: any) => `
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                                <span>${item.tank_type}</span>
                                <span>${formatCurrency(Number(item.price) * item.quantity)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; color: #666;">
                                <span>${item.quantity} x ${formatCurrency(Number(item.price))}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                        <span>Tax (12%):</span>
                        <span>${formatCurrency(tax)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-weight: bold; font-size: 13px;">
                        <span>TOTAL:</span>
                        <span>${formatCurrency(total)}</span>
                    </div>
                </div>

                <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

                <div style="text-align: center; margin-top: 10px;">
                    <div>Thank you for your business!</div>
                    <div>Please come again</div>
                </div>
            </div>
        `;
    };

    const processSale = () => {
        if (cart.length === 0) return;
        if (!customerName || !paymentMethod) {
            showAlert('Error', 'Please fill in customer name and payment method', 'error');
            return;
        }

        // Validate cash amount for cash payments
        if (paymentMethod === 'cash') {
            const cash = parseFloat(cashAmount);
            const total = getTotalAmount();
            if (!cashAmount || cash < total) {
                setCashWarning(`Insufficient cash! Amount must be at least ₱${total.toFixed(2)}`);
                return;
            }
            setCashWarning('');
        }

        const items = cart.map(item => ({
            tank_id: item.tank.id,
            tank_type: item.tank.tank_type,
            quantity: item.quantity,
            price: item.tank.price
        }));

        const saleData = {
            customer_name: customerName,
            payment_method: paymentMethod,
            items: items,
            total_amount: getTotalAmount(),
            // Add GCash verification details if payment method is GCash
            ...(paymentMethod === 'gcash' && {
                gcash_reference: gcashReferenceNumber,
                customer_phone: customerPhoneNumber,
                payment_time: paymentTimestamp
            })
        };

        router.post('/cashier/process', saleData, {
            onSuccess: (response) => {
                // Store sale data for receipt, show modal, and auto-print
                if (response.props.flash?.success) {
                    const saleId = response.props.flash.success.match(/Sale #(\d+)/)?.[1];
                    
                    const receiptData = {
                        id: saleId ? parseInt(saleId) : undefined,
                        customer_name: customerName,
                        payment_method: paymentMethod,
                        total_amount: getTotalAmount(),
                        cash_amount: paymentMethod === 'cash' ? parseFloat(cashAmount) : getTotalAmount(),
                        change: paymentMethod === 'cash' ? getChange() : 0,
                        items: cart.map(item => ({
                            tank_type: item.tank.tank_type,
                            quantity: item.quantity,
                            price: item.tank.price
                        })),
                        created_at: new Date().toISOString()
                    };
                    
                    setLastSaleData(receiptData);
                    
                    // Show receipt modal (auto-print happens inside ReceiptPrint component)
                    setShowReceipt(true);
                    
                    // Clear cart after showing receipt
                    setTimeout(() => {
                        setCart([]);
                        setCustomerName('');
                        setPaymentMethod('');
                        setCashAmount('');
                        setCashWarning('');
                    }, 2000);
                }
            },
            onError: (errors) => {
                showAlert('Error', 'Error processing sale: ' + JSON.stringify(errors), 'error');
            }
        });
    };

    const handleStartShift = () => {
        router.post('/cashier/start-shift', {}, {
            onSuccess: () => {
                showAlert('Success', 'Shift started successfully!', 'success');
                // The page will reload and show the updated shift status
            },
            onError: (errors) => {
                showAlert('Error', 'Error starting shift: ' + JSON.stringify(errors), 'error');
            }
        });
    };

    const handleEndShift = () => {
        router.post('/cashier/end-shift', {}, {
            onSuccess: (page) => {
                // The end shift report data is now in page.props.endShiftReport
                if (page.props.endShiftReport) {
                    setEndShiftData(page.props.endShiftReport);
                    setShowEndShiftReport(true);
                } else {
                    showAlert('Error', 'No end shift data received', 'error');
                }
            },
            onError: (errors) => {
                showAlert('Error', 'Error generating end shift report: ' + JSON.stringify(errors), 'error');
            }
        });
    };

    const printEndShiftReport = () => {
        // Create a hidden iframe for reliable printing (same approach as receipt)
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
        
        // Generate the HTML for the end shift report
        const reportHTML = generateEndShiftReportHTML(endShiftData);
        
        // Write report HTML to iframe
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>End Shift Report</title>
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
                ${reportHTML}
            </body>
            </html>
        `);
        iframeDoc.close();
        
        // Wait for iframe to load then print
        setTimeout(() => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (error) {
                console.error('Print error:', error);
            }
            
            // Clean up after printing and logout
            setTimeout(() => {
                document.body.removeChild(iframe);
                
                // Show completion message and logout
                showAlert('Shift Complete', 'End shift report printed successfully. Logging out...', 'success');
                
                // Close the modal first
                setShowEndShiftReport(false);
                
                // Logout after a short delay to allow message to be seen
                setTimeout(() => {
                    router.post('/logout');
                }, 1500);
            }, 1000);
        }, 300);
    };

    const generateEndShiftReportHTML = (reportData: any) => {
        if (!reportData) return '';
        
        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(amount);
        };

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            // Use Manila timezone (Asia/Manila)
            const options: Intl.DateTimeFormatOptions = {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            return date.toLocaleString('en-PH', options);
        };

        // Calculate item summary
        const itemSummary: { [key: string]: { quantity: number; amount: number } } = {};
        reportData.sales.forEach((sale: any) => {
            sale.items.forEach((item: any) => {
                if (!itemSummary[item.tank_type]) {
                    itemSummary[item.tank_type] = { quantity: 0, amount: 0 };
                }
                itemSummary[item.tank_type].quantity += item.quantity;
                itemSummary[item.tank_type].amount += (item.price * item.quantity);
            });
        });

        return `
            <div style="font-family: 'Courier New', monospace; padding: 10px; max-width: 320px; margin: 0 auto; font-size: 11px; line-height: 1.4;">
                <!-- Shop Header -->
                <div style="text-align: center; margin-bottom: 8px;">
                    <div style="font-size: 16px; font-weight: bold; letter-spacing: 2px;">MV OXYGEN</div>
                    <div style="font-size: 10px;">Gas Cylinder Sales & Services</div>
                    <div style="font-size: 9px; margin-top: 2px;">Contact No: 0977-330-5640</div>
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- END SHIFT REPORT Title -->
                <div style="text-align: center; font-size: 13px; font-weight: bold; letter-spacing: 2px; margin: 8px 0;">
                    END SHIFT REPORT
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- Shift Info -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cashier:</span>
                        <span>${reportData.cashier_name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Shift Start:</span>
                        <span>${formatDate(reportData.shift_start_time)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Shift End:</span>
                        <span>${formatDate(reportData.shift_end_time)}</span>
                    </div>
                </div>

                <div style="text-align: center; margin: 8px 0;">----------------------------------------</div>

                <!-- Summary -->
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Total Sales:</span>
                        <span>${reportData.total_sales}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Customers:</span>
                        <span>${reportData.unique_customers}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; margin-top: 4px;">
                        <span>TOTAL REVENUE:</span>
                        <span>${formatCurrency(reportData.total_revenue)}</span>
                    </div>
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- Payment Breakdown -->
                <div style="margin-bottom: 8px;">
                    <div style="text-align: center; font-size: 10px; font-weight: bold; margin-bottom: 4px;">
                        PAYMENT BREAKDOWN
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cash Sales:</span>
                        <span>${formatCurrency(reportData.cash_sales)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>GCash Sales:</span>
                        <span>${formatCurrency(reportData.gcash_sales)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Card Sales:</span>
                        <span>${formatCurrency(reportData.card_sales)}</span>
                    </div>
                </div>

                <div style="text-align: center; margin: 8px 0;">----------------------------------------</div>

                <!-- Transaction List Header -->
                <div style="text-align: center; font-size: 10px; font-weight: bold; margin-bottom: 4px;">
                    TRANSACTIONS (${reportData.sales.length})
                </div>

                <!-- Column Headers -->
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px; font-size: 9px;">
                    <span style="flex: 1;">#</span>
                    <span style="flex: 2;">Customer</span>
                    <span style="flex: 1; text-align: right;">Amount</span>
                </div>

                <div style="text-align: center; margin: 5px 0;">----------------------------------------</div>

                <!-- Transactions -->
                <div style="margin-bottom: 8px;">
                    ${reportData.sales.slice(0, 10).map((sale: any) => `
                        <div style="margin-bottom: 4px;">
                            <div style="display: flex; justify-content: space-between; font-size: 9px;">
                                <span style="flex: 1;">#${sale.id}</span>
                                <span style="flex: 2;">${sale.customer_name.length > 12 ? sale.customer_name.substring(0, 12) + '...' : sale.customer_name}</span>
                                <span style="flex: 1; text-align: right;">${formatCurrency(sale.total_amount)}</span>
                            </div>
                            <div style="font-size: 8px; color: #666; margin-left: 20px;">
                                ${sale.payment_method.toUpperCase()} • ${new Date(sale.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    `).join('')}
                    ${reportData.sales.length > 10 ? `
                        <div style="text-align: center; font-size: 9px; font-style: italic; margin-top: 4px;">
                            ... and ${reportData.sales.length - 10} more
                        </div>
                    ` : ''}
                </div>

                <div style="text-align: center; margin: 8px 0;">----------------------------------------</div>

                <!-- Items Sold Header -->
                <div style="text-align: center; font-size: 10px; font-weight: bold; margin-bottom: 4px;">
                    ITEMS SOLD SUMMARY
                </div>

                <!-- Items Column Headers -->
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px; font-size: 9px;">
                    <span style="flex: 2;">Item</span>
                    <span style="flex: 1; text-align: right;">Qty</span>
                    <span style="flex: 1; text-align: right;">Total</span>
                </div>

                <div style="text-align: center; margin: 5px 0;">----------------------------------------</div>

                <!-- Items -->
                <div style="margin-bottom: 8px;">
                    ${Object.entries(itemSummary).map(([tankType, summary]: [string, any]) => `
                        <div style="margin-bottom: 4px;">
                            <div style="display: flex; justify-content: space-between; font-size: 9px;">
                                <span style="flex: 2;">${tankType.length > 15 ? tankType.substring(0, 15) + '...' : tankType}</span>
                                <span style="flex: 1; text-align: right;">${summary.quantity}</span>
                                <span style="flex: 1; text-align: right;">${formatCurrency(summary.amount)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="text-align: center; margin: 8px 0;">***************************************</div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 10px;">
                    <div style="font-size: 14px; font-weight: bold; letter-spacing: 2px; margin-bottom: 5px;">SHIFT COMPLETE</div>
                    <div style="font-size: 9px;">Thank you for your service</div>
                    <div style="font-size: 8px; margin-top: 8px; color: #666;">
                        This is an official end of shift report<br />
                        Keep for business records
                    </div>
                </div>

                <!-- Signature Lines -->
                <div style="margin-top: 15px;">
                    <div style="margin-bottom: 10px;">
                        <div style="font-size: 9px; margin-bottom: 3px;">Cashier Signature:</div>
                        <div style="border-bottom: 1px solid black; height: 20px;"></div>
                    </div>
                    <div>
                        <div style="font-size: 9px; margin-bottom: 3px;">Manager Signature:</div>
                        <div style="border-bottom: 1px solid black; height: 20px;"></div>
                    </div>
                </div>

                <!-- Barcode representation -->
                <div style="text-align: center; margin-top: 10px; font-family: monospace; font-size: 14px; letter-spacing: 2px;">
                    ||| || ||| || |||| ||| || |||
                </div>
                <div style="text-align: center; font-size: 9px; margin-top: 2px;">
                    SHIFT-${reportData.shift_date.replace(/-/g, '')}
                </div>
            </div>
        `;
    };

    return (
        <CashierLayout>
            <Head title="Cashier" />
            
            <div className="flex-1 space-y-4 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cashier POS</h1>
                        <p className="text-sm text-gray-600">
                            {(page.props as any).shiftActive ? 'Process sales and manage transactions' : 'Start your shift to begin processing sales'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!(page.props as any).shiftActive ? (
                            <Button
                                onClick={handleStartShift}
                                size="sm"
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Play className="w-4 h-4" />
                                Start Shift
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleEndShift}
                                    size="sm"
                                    className="flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                >
                                    <FileText className="w-4 h-4" />
                                    End Shift
                                </Button>
                                
                                <Badge variant="outline" className="text-sm">
                                    {getTotalItems()} items
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                    ₱{getTotalAmount().toFixed(2)}
                                </Badge>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Available Tanks */}
                    <div className="md:col-span-2">
                        <Card className={(page.props as any).shiftActive ? '' : 'opacity-50 pointer-events-none'}>
                            <CardHeader>
                                <div className="flex flex-col gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Available Tanks
                                        {!(page.props as any).shiftActive && (
                                            <Badge variant="outline" className="text-xs text-red-600">
                                                Shift Not Started
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    {/* Search Tanks */}
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <Input
                                            type="text"
                                            placeholder="Search tanks..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Tank Count */}
                                {searchQuery && (
                                    <div className="text-sm text-gray-500 mb-2">
                                        {tanks.filter(tank =>
                                            tank.tank_type.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).length} tank(s) found
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {(() => {
                                        const filteredTanks = tanks.filter(tank =>
                                            tank.tank_type.toLowerCase().includes(searchQuery.toLowerCase())
                                        );

                                        if (filteredTanks.length === 0) {
                                            return (
                                                <div className="col-span-full py-8 text-center text-gray-500">
                                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p className="text-sm">No tanks found matching &quot;{searchQuery}&quot;</p>
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                                                    >
                                                        Clear search
                                                    </button>
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
                                                {filteredTanks.map(tank => (
                                                <Card key={tank.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex flex-col space-y-3">
                                                            {/* Tank Image */}
                                                            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                                                {tank.image ? (
                                                                    <img
                                                                        src={`/storage/${tank.image}`}
                                                                        alt={tank.tank_type}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.src = '/placeholder-tank.png';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                        <Package className="w-12 h-12 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col space-y-2">
                                                                <div className="flex justify-between items-start">
                                                                    <h3 className="font-semibold text-sm">{tank.tank_type}</h3>
                                                                    <Badge variant={tank.quantity > 0 ? "default" : "secondary"}>
                                                                        {tank.quantity} available
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-lg font-bold text-green-600">
                                                                    ₱{Number(tank.price).toFixed(2)}
                                                                </p>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => addToCart(tank)}
                                                                    disabled={tank.quantity === 0}
                                                                    className="w-full"
                                                                >
                                                                    <Plus className="h-4 w-4 mr-1" />
                                                                    Add to Cart
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cart and Checkout */}
                    <div className="space-y-4">
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <Input
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter customer name"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Payment Method</label>
                                    <Select value={paymentMethod} onValueChange={(value) => {
                                        setPaymentMethod(value);
                                        if (value !== 'cash') {
                                            setCashAmount('');
                                            setCashWarning('');
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="gcash">GCash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* GCash QR Code Display */}
                                {paymentMethod === 'gcash' && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-blue-800">GCash Payment</h4>
                                                <p className="text-sm text-blue-600">
                                                    Total: ₱{getTotalAmount().toFixed(2)}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={showGCashQR}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <QrCode className="h-4 w-4" />
                                                Show GCash QR
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Cash Amount Input - Only show when payment method is cash */}
                                {paymentMethod === 'cash' && (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-sm font-medium">Cash Received</label>
                                            <Input
                                                type="number"
                                                min={getTotalAmount()}
                                                step="0.01"
                                                value={cashAmount}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setCashAmount(value);
                                                    const cash = parseFloat(value) || 0;
                                                    const total = getTotalAmount();
                                                    if (value && cash < total) {
                                                        setCashWarning(`Insufficient cash! Need ₱${(total - cash).toFixed(2)} more`);
                                                    } else {
                                                        setCashWarning('');
                                                    }
                                                }}
                                                placeholder={`Minimum: ₱${getTotalAmount().toFixed(2)}`}
                                                className={cashWarning ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            />
                                        </div>

                                        {/* Warning Message */}
                                        {cashWarning && (
                                            <div className="bg-red-50 p-3 rounded border border-red-200 flex items-start gap-2">
                                                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div>
                                                    <p className="text-red-700 font-medium text-sm">{cashWarning}</p>
                                                    <p className="text-red-500 text-xs mt-0.5">
                                                        Minimum required: ₱{getTotalAmount().toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Change Display */}
                                        {parseFloat(cashAmount) > 0 && !cashWarning && (
                                            <div className="bg-green-50 p-3 rounded border border-green-200">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-green-700">Total:</span>
                                                    <span className="font-medium">₱{getTotalAmount().toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-green-700">Cash:</span>
                                                    <span className="font-medium">₱{parseFloat(cashAmount || '0').toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-green-800 border-t border-green-200 pt-1 mt-1">
                                                    <span>Change:</span>
                                                    <span>₱{getChange().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <span className="font-bold">₱</span>
                                        Cart
                                    </span>
                                    <Badge variant="outline">{getTotalItems()} items</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cart.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Cart is empty
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.tank.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {/* Tank Image in Cart */}
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.tank.image ? (
                                                            <img 
                                                                src={`/storage/${item.tank.image}`} 
                                                                alt={item.tank.tank_type}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/placeholder-tank.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm">{item.tank.tank_type}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            ₱{Number(item.tank.price).toFixed(2)} each
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateQuantity(item.tank.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateQuantity(item.tank.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.tank.quantity}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => removeFromCart(item.tank.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <Separator />
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>₱{getSubtotal().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Tax (12%)</span>
                                                <span>₱{getTax().toFixed(2)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>₱{getTotalAmount().toFixed(2)}</span>
                                            </div>
                                        </div>
                                        
                                        <Button
                                            onClick={processSale}
                                            className="w-full"
                                            disabled={cart.length === 0 || !customerName || !paymentMethod}
                                        >
                                            <Receipt className="h-4 w-4 mr-2" />
                                            Process Sale
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

        {/* Receipt Print Dialog */}
        {lastSaleData && (
            <ReceiptPrint
                isOpen={showReceipt}
                onClose={() => {
                    setShowReceipt(false);
                    setLastSaleData(null);
                }}
                saleData={lastSaleData}
            />
        )}

        {/* GCash QR Code Modal */}
        {showQRCode && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-4 max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">GCash QR Code</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowQRCode(false)}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4">
                        <p className="text-center text-gray-600 mb-4">
                            Scan this QR code with your GCash app to complete the payment of ₱{getTotalAmount().toFixed(2)}
                        </p>
                        
                        {/* QR Code Display */}
                        <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                <img 
                                    src="/gcash-qr-code.jpg" 
                                    alt="GCash QR Code"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Scan this QR code with your GCash app
                            </p>
                        </div>

                        {/* Payment Confirmation Section */}
                        <div className="w-full space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800 text-center font-semibold mb-2">
                                    🔒 SECURITY VERIFICATION REQUIRED
                                </p>
                                <p className="text-sm text-yellow-800 text-center">
                                    <strong>Step 1:</strong> Customer scans QR code with GCash app
                                </p>
                                <p className="text-sm text-yellow-800 text-center mt-1">
                                    <strong>Step 2:</strong> Verify payment details match (Amount: ₱{getTotalAmount().toFixed(2)})
                                </p>
                                <p className="text-sm text-yellow-800 text-center mt-1">
                                    <strong>Step 3:</strong> Check customer's GCash app for "Payment Successful"
                                </p>
                                <p className="text-sm text-yellow-800 text-center mt-1">
                                    <strong>Step 4:</strong> Record payment details below for audit trail
                                </p>
                            </div>

                            {/* Security Verification Fields */}
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
                                    <label className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded">Customer Phone Number *</label>
                                    <Input
                                        type="text"
                                        maxLength={11}
                                        placeholder="09XXXXXXXXX"
                                        value={customerPhoneNumber}
                                        onChange={(e) => setCustomerPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        className={`mt-1 bg-red-50 ${customerPhoneNumber && !/^09\d{9}$/.test(customerPhoneNumber) ? 'border-red-500 ring-1 ring-red-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500'}`}
                                    />
                                    {customerPhoneNumber && !/^09\d{9}$/.test(customerPhoneNumber) && (
                                        <p className="text-xs text-red-600 mt-1 font-medium">Must be 11 digits starting with 09</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded">Payment Time *</label>
                                    <Input
                                        type="time"
                                        value={paymentTimestamp}
                                        onChange={(e) => setPaymentTimestamp(e.target.value)}
                                        className="mt-1 border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
                                    />
                                </div>
                            </div>

                            {/* Final Confirmation Checkbox */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="paymentConfirmed"
                                        checked={gcashPaymentConfirmed}
                                        onChange={(e) => setGcashPaymentConfirmed(e.target.checked)}
                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                                    />
                                    <div>
                                        <label htmlFor="paymentConfirmed" className="text-sm font-medium text-green-800">
                                            I confirm that:
                                        </label>
                                        <ul className="text-xs text-green-700 mt-1 space-y-1">
                                            <li>• Customer has successfully paid ₱{getTotalAmount().toFixed(2)} via GCash</li>
                                            <li>• I have verified the payment on customer's GCash app</li>
                                            <li>• All payment details above are accurate and complete</li>
                                            <li>• I understand this action cannot be undone</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowQRCode(false);
                                    setGcashPaymentConfirmed(false);
                                    setGcashReferenceNumber('');
                                    setCustomerPhoneNumber('');
                                    setPaymentTimestamp('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowQRCode(false);
                                    setGcashPaymentConfirmed(false);
                                    setGcashReferenceNumber('');
                                    setCustomerPhoneNumber('');
                                    setPaymentTimestamp('');
                                    processSale();
                                }}
                                disabled={
                                    !gcashPaymentConfirmed || 
                                    !/^\d{13}$/.test(gcashReferenceNumber) || 
                                    !/^09\d{9}$/.test(customerPhoneNumber) || 
                                    !paymentTimestamp.trim()
                                }
                                className="bg-green-600 hover:bg-green-700"
                            >
                                🔒 Confirm Payment & Process Sale
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* End Shift Report Modal */}
        {showEndShiftReport && endShiftData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Daily Transaction Report</h3>
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={printEndShiftReport}
                                    size="sm"
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print & Logout
                                </Button>
                                <Button
                                    onClick={() => setShowEndShiftReport(false)}
                                    variant="outline"
                                    size="sm"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[70vh]" id="end-shift-report-content">
                        <EndShiftReport reportData={endShiftData} />
                    </div>
                </div>
            </div>
        )}

        {/* Alert Modal */}
        <AlertModal
            isOpen={showAlertModal}
            onClose={() => setShowAlertModal(false)}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
        />
    </CashierLayout>
    );
}
