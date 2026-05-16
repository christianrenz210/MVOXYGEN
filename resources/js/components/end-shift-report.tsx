import React from 'react';

interface EndShiftReportProps {
    reportData: {
        cashier_name: string;
        shift_date: string;
        shift_end_time: string;
        total_sales: number;
        total_revenue: number;
        cash_sales: number;
        gcash_sales: number;
        card_sales: number;
        unique_customers: number;
        sales: Array<{
            id: number;
            customer_name: string;
            payment_method: string;
            total_amount: number;
            items: Array<{
                tank_type: string;
                quantity: number;
                price: number;
            }>;
            created_at: string;
        }>;
    };
}

const EndShiftReport: React.FC<EndShiftReportProps> = ({ reportData }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH') + ' ' + date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate item summary
    const itemSummary: { [key: string]: { quantity: number; amount: number } } = {};
    reportData.sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!itemSummary[item.tank_type]) {
                itemSummary[item.tank_type] = { quantity: 0, amount: 0 };
            }
            itemSummary[item.tank_type].quantity += item.quantity;
            itemSummary[item.tank_type].amount += (item.price * item.quantity);
        });
    });

    return (
        <div style={{ fontFamily: "'Courier New', monospace", padding: '10px', maxWidth: '320px', margin: '0 auto', fontSize: '11px', lineHeight: '1.4' }}>
            {/* Shop Header */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>MV OXYGEN</div>
                <div style={{ fontSize: '10px' }}>Gas Cylinder Sales & Services</div>
                <div style={{ fontSize: '9px', marginTop: '2px' }}>Tel: (02) 8-XXX-XXXX</div>
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>***************************************</div>

            {/* END SHIFT REPORT Title */}
            <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', margin: '8px 0' }}>
                END SHIFT REPORT
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>***************************************</div>

            {/* Shift Info */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cashier:</span>
                    <span>{reportData.cashier_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Date:</span>
                    <span>{formatDate(reportData.shift_date)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shift End:</span>
                    <span>{formatDate(reportData.shift_end_time)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>----------------------------------------</div>

            {/* Summary */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Sales:</span>
                    <span>{reportData.total_sales}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Customers:</span>
                    <span>{reportData.unique_customers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
                    <span>TOTAL REVENUE:</span>
                    <span>{formatCurrency(reportData.total_revenue)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>***************************************</div>

            {/* Payment Breakdown */}
            <div style={{ marginBottom: '8px' }}>
                <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                    PAYMENT BREAKDOWN
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash Sales:</span>
                    <span>{formatCurrency(reportData.cash_sales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GCash Sales:</span>
                    <span>{formatCurrency(reportData.gcash_sales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Card Sales:</span>
                    <span>{formatCurrency(reportData.card_sales)}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>----------------------------------------</div>

            {/* Transaction List Header */}
            <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                TRANSACTIONS ({reportData.sales.length})
            </div>

            {/* Column Headers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '5px', fontSize: '9px' }}>
                <span style={{ flex: '1' }}>#</span>
                <span style={{ flex: '2' }}>Customer</span>
                <span style={{ flex: '1', textAlign: 'right' }}>Amount</span>
            </div>

            <div style={{ textAlign: 'center', margin: '5px 0' }}>----------------------------------------</div>

            {/* Transactions */}
            <div style={{ marginBottom: '8px' }}>
                {reportData.sales.slice(0, 10).map((sale) => (
                    <div key={sale.id} style={{ marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                            <span style={{ flex: '1' }}>#{sale.id}</span>
                            <span style={{ flex: '2' }}>{sale.customer_name.length > 12 ? sale.customer_name.substring(0, 12) + '...' : sale.customer_name}</span>
                            <span style={{ flex: '1', textAlign: 'right' }}>{formatCurrency(sale.total_amount)}</span>
                        </div>
                        <div style={{ fontSize: '8px', color: '#666', marginLeft: '20px' }}>
                            {sale.payment_method.toUpperCase()} • {new Date(sale.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                {reportData.sales.length > 10 && (
                    <div style={{ textAlign: 'center', fontSize: '9px', fontStyle: 'italic', marginTop: '4px' }}>
                        ... and {reportData.sales.length - 10} more
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>----------------------------------------</div>

            {/* Items Sold Header */}
            <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                ITEMS SOLD SUMMARY
            </div>

            {/* Items Column Headers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '5px', fontSize: '9px' }}>
                <span style={{ flex: '2' }}>Item</span>
                <span style={{ flex: '1', textAlign: 'right' }}>Qty</span>
                <span style={{ flex: '1', textAlign: 'right' }}>Total</span>
            </div>

            <div style={{ textAlign: 'center', margin: '5px 0' }}>----------------------------------------</div>

            {/* Items */}
            <div style={{ marginBottom: '8px' }}>
                {Object.entries(itemSummary).map(([tankType, summary]) => (
                    <div key={tankType} style={{ marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                            <span style={{ flex: '2' }}>{tankType.length > 15 ? tankType.substring(0, 15) + '...' : tankType}</span>
                            <span style={{ flex: '1', textAlign: 'right' }}>{summary.quantity}</span>
                            <span style={{ flex: '1', textAlign: 'right' }}>{formatCurrency(summary.amount)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', margin: '8px 0' }}>***************************************</div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '5px' }}>SHIFT COMPLETE</div>
                <div style={{ fontSize: '9px' }}>Thank you for your service</div>
                <div style={{ fontSize: '8px', marginTop: '8px', color: '#666' }}>
                    This is an official end of shift report<br />
                    Keep for business records
                </div>
            </div>

            {/* Signature Lines */}
            <div style={{ marginTop: '15px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '9px', marginBottom: '3px' }}>Cashier Signature:</div>
                    <div style={{ borderBottom: '1px solid black', height: '20px' }}></div>
                </div>
                <div>
                    <div style={{ fontSize: '9px', marginBottom: '3px' }}>Manager Signature:</div>
                    <div style={{ borderBottom: '1px solid black', height: '20px' }}></div>
                </div>
            </div>

            {/* Barcode representation */}
            <div style={{ textAlign: 'center', marginTop: '10px', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '2px' }}>
                ||| || ||| || |||| ||| || |||
            </div>
            <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '2px' }}>
                SHIFT-{reportData.shift_date.replace(/-/g, '')}
            </div>
        </div>
    );
};

export default EndShiftReport;
