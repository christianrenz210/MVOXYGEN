import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Package, Plus, Minus, Trash2, Receipt, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import ReceiptPrint from '@/components/receipt-print';

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
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSaleData, setLastSaleData] = useState<any>(null);

    const getChange = () => {
        const cash = parseFloat(cashAmount) || 0;
        const total = getTotalAmount();
        return Math.max(0, cash - total);
    };

    // Listen for flash messages from Inertia shared props
    const page = usePage();
    const flashSuccess = (page.props as any).flash?.success as string | undefined;
    const flashError = (page.props as any).flash?.error as string | undefined;

    useEffect(() => {
        if (flashSuccess) {
            console.log('=== Flash success detected ===', flashSuccess);
            // Extract sale ID from flash message (e.g., "Sale #123 processed successfully!")
            const saleIdMatch = flashSuccess.match(/Sale #(\d+)/);
            const saleId = saleIdMatch ? parseInt(saleIdMatch[1]) : undefined;
            console.log('Extracted sale ID from flash:', saleId);
        }
        if (flashError) {
            console.log('=== Flash error detected ===', flashError);
            alert(flashError);
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

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + (Number(item.tank.price) * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const printReceiptDirectly = (saleData: any) => {
        console.log('=== Starting print receipt ===');
        console.log('Sale data:', saleData);
        
        try {
            // Try the simplest approach first - use window.print() with a print stylesheet
            console.log('=== Creating print element ===');
            const printElement = document.createElement('div');
            printElement.id = 'print-receipt';
            const receiptHTML = generateReceiptHTML(saleData);
            console.log('Generated HTML length:', receiptHTML.length);
            printElement.innerHTML = receiptHTML;
            printElement.style.position = 'absolute';
            printElement.style.left = '-9999px';
            printElement.style.top = '-9999px';
            document.body.appendChild(printElement);
            console.log('=== Print element added to DOM ===');

            // Create print stylesheet
            console.log('=== Creating print stylesheet ===');
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
            console.log('=== Print stylesheet added ===');

            setTimeout(() => {
                console.log('=== About to trigger window.print() ===');
                console.log('Print element exists:', document.getElementById('print-receipt') !== null);
                console.log('Print styles exist:', document.querySelector('style[data-print-styles]') !== null);
                
                // Test if window.print is available
                if (typeof window.print === 'function') {
                    console.log('=== window.print is available, triggering now ===');
                    window.print();
                    console.log('=== window.print called ===');
                } else {
                    console.error('=== window.print is not available ===');
                    alert('Print function is not available in this browser');
                }
                
                // Clean up after printing
                setTimeout(() => {
                    console.log('=== Cleaning up print elements ===');
                    if (document.getElementById('print-receipt')) {
                        document.body.removeChild(printElement);
                    }
                    if (printStyles.parentNode) {
                        document.head.removeChild(printStyles);
                    }
                    console.log('=== Cleanup complete ===');
                }, 2000);
            }, 1000);
        } catch (error) {
            console.error('=== Error in printReceiptDirectly ===', error);
            alert('Print error: ' + error.message);
        }
    };

    // Add a simple test function
    const testPrint = () => {
        console.log('=== Testing simple print ===');
        const testElement = document.createElement('div');
        testElement.innerHTML = '<h1>TEST PRINT</h1><p>This is a test print to see if printing works.</p>';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.top = '-9999px';
        document.body.appendChild(testElement);
        
        setTimeout(() => {
            console.log('=== Triggering test print ===');
            window.print();
            
            setTimeout(() => {
                document.body.removeChild(testElement);
                console.log('=== Test print cleanup ===');
            }, 1000);
        }, 500);
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
            alert('Please fill in customer name and payment method');
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
            total_amount: getTotalAmount()
        };

        console.log('=== Sending sale request ===');
        console.log('Sale data:', saleData);

        router.post('/cashier/process', saleData, {
            onSuccess: (response) => {
                console.log('=== Sale processed successfully ===');
                console.log('Response:', response);
                console.log('Flash success:', response.props.flash?.success);
                
                // Store sale data for receipt, show modal, and auto-print
                if (response.props.flash?.success) {
                    console.log('=== Processing receipt data ===');
                    const saleId = response.props.flash.success.match(/Sale #(\d+)/)?.[1];
                    console.log('Extracted sale ID:', saleId);
                    
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
                    console.log('Receipt data created:', receiptData);
                    
                    setLastSaleData(receiptData);
                    console.log('setLastSaleData called');
                    
                    // Show receipt modal (auto-print happens inside ReceiptPrint component)
                    setShowReceipt(true);
                    console.log('setShowReceipt called - modal should show and auto-print');
                    
                    // Clear cart after showing receipt
                    setTimeout(() => {
                        console.log('=== Clearing cart ===');
                        setCart([]);
                        setCustomerName('');
                        setPaymentMethod('');
                        setCashAmount('');
                        setCashWarning('');
                    }, 2000);
                } else {
                    console.log('=== No flash success found ===');
                }
            },
            onError: (errors) => {
                console.error('=== Sale processing error ===');
                console.error('Errors:', errors);
                alert('Error processing sale: ' + JSON.stringify(errors));
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Cashier" />
            
            <div className="flex-1 space-y-4 p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Cashier</h2>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => {
                                console.log('=== Manual test trigger ===');
                                const testData = {
                                    id: 999,
                                    customer_name: 'Test Customer',
                                    payment_method: 'cash',
                                    total_amount: 1000,
                                    items: [{
                                        tank_type: 'Test Tank',
                                        quantity: 1,
                                        price: 1000
                                    }],
                                    created_at: new Date().toISOString()
                                };
                                setLastSaleData(testData);
                                setShowReceipt(true);
                                console.log('=== Test receipt modal should show ===');
                            }}
                            variant="outline"
                            size="sm"
                        >
                            Test Receipt
                        </Button>
                        <Badge variant="outline" className="text-sm">
                            {getTotalItems()} items
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                            ₱{getTotalAmount().toFixed(2)}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Available Tanks */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Available Tanks
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
                                                                        src={tank.image}
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
                                            <SelectItem value="card">Credit Card</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

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
                                        <DollarSign className="h-5 w-5" />
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
                                                                src={item.tank.image} 
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
                                                <span>₱{getTotalAmount().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Tax (0%)</span>
                                                <span>₱0.00</span>
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
        </AppLayout>
    );
}
