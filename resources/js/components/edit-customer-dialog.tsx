import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { sanitizePhoneDigits } from '@/utils/phone';

interface Customer {
    id: number;
    name: string;
    contact_number: string;
    address: string;
    status: 'active' | 'inactive' | 'archived';
}

interface EditCustomerDialogProps {
    customer: Customer;
    onSuccess?: () => void;
}

export default function EditCustomerDialog({ customer, onSuccess }: EditCustomerDialogProps) {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        name: customer.name,
        contact_number: customer.contact_number,
        address: customer.address,
        status: customer.status,
    });

    // Real-time validation for contact number
    const validateContactNumber = (value: string) => {
        if (!value) {
            return 'Contact number is required.';
        }

        if (value.length !== 11) {
            return 'Contact number must be exactly 11 digits.';
        }

        if (!value.startsWith('09')) {
            return 'Contact number must start with 09.';
        }

        return '';
    };

    const [contactWarning, setContactWarning] = useState('');

    const handleContactNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = sanitizePhoneDigits(e.target.value);
        setData('contact_number', digits);
        setContactWarning(digits ? validateContactNumber(digits) : '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check for contact number warnings before submission
        const warning = validateContactNumber(data.contact_number);
        if (warning) {
            setContactWarning(warning);
            return;
        }
        
        put(`/customer/${customer.id}`, {
            onSuccess: () => {
                setOpen(false);
                reset();
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Form errors:', errors);
            },
        });
    };

    const handleClose = () => {
        setOpen(false);
        reset();
        setContactWarning('');
    };

    const handleOpen = () => {
        setOpen(true);
        // Reset form with current customer data
        setData({
            name: customer.name,
            contact_number: customer.contact_number,
            address: customer.address,
            status: customer.status,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>
                        Update customer information. Modify the fields below and save changes.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter customer name"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input
                                id="contact_number"
                                type="tel"
                                inputMode="numeric"
                                maxLength={11}
                                value={data.contact_number}
                                onChange={handleContactNumberChange}
                                placeholder="9XXXXXXXXXX"
                                className={contactWarning ? 'border-orange-500 focus:border-orange-500' : ''}
                                required
                            />
                            {contactWarning && (
                                <p className="text-sm text-orange-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    {contactWarning}
                                </p>
                            )}
                            {errors.contact_number && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {errors.contact_number}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                type="text"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Enter complete address"
                                required
                            />
                            {errors.address && (
                                <p className="text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive' | 'archived')}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="archived">Archived</option>
                            </select>
                            {errors.status && (
                                <p className="text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Customer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
