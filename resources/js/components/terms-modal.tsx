import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TermsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TermsModal({ open, onOpenChange }: TermsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Terms & Conditions</DialogTitle>
                    <DialogDescription>
                        Please read our terms and conditions carefully before using our services.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
                        <p>
                            By accessing and using MV Oxygen's services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">2. Description of Service</h3>
                        <p>
                            MV Oxygen provides oxygen tank rental and delivery services to residential and commercial customers in Nueva Ecija and surrounding areas.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">3. User Responsibilities</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide accurate and complete information when registering</li>
                            <li>Ensure tanks are used according to safety guidelines</li>
                            <li>Return tanks on time and in good condition</li>
                            <li>Report any issues or damages immediately</li>
                            <li>Pay rental fees on time</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">4. Payment Terms</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All prices are subject to change without notice</li>
                            <li>Payment must be made before or at the time of delivery</li>
                            <li>Late payments may incur additional fees</li>
                            <li>Refunds are subject to our refund policy</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">5. Safety Guidelines</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Handle oxygen tanks with care and follow all safety instructions</li>
                            <li>Keep tanks away from heat sources and open flames</li>
                            <li>Ensure proper ventilation when using oxygen tanks</li>
                            <li>Report any leaks or damaged tanks immediately</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">6. Limitation of Liability</h3>
                        <p>
                            MV Oxygen shall not be liable for any damages, injuries, or losses resulting from improper use of our equipment or failure to follow safety guidelines.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">7. Termination</h3>
                        <p>
                            We reserve the right to terminate service for violation of these terms or non-payment.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">8. Contact Information</h3>
                        <p>
                            For questions about these terms, please contact us at:
                        </p>
                        <p className="font-medium">
                            📧 Email: support@mvoxygen.com<br />
                            📞 Phone: (044) 123-4567<br />
                            📍 Address: PWS 049, Rizal Street, Poblacion West, General Tinio, Nueva Ecija
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">9. Changes to Terms</h3>
                        <p>
                            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">10. Effective Date</h3>
                        <p>
                            These terms are effective as of May 3, 2026.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
