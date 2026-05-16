import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface PrivacyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
                    <DialogDescription>
                        Learn how we collect, use, and protect your information.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Information:</strong> Name, email, phone number, address</li>
                            <li><strong>Account Information:</strong> Username, password (encrypted)</li>
                            <li><strong>Usage Data:</strong> Rental history, tank usage patterns</li>
                            <li><strong>Payment Information:</strong> Payment method, billing address</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">2. How We Use Your Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Service Provision:</strong> To provide oxygen tank rental and delivery services</li>
                            <li><strong>Account Management:</strong> To create and manage your user account</li>
                            <li><strong>Customer Support:</strong> To respond to inquiries and resolve issues</li>
                            <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our services</li>
                            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                            <li><strong>Safety Monitoring:</strong> To ensure proper usage and safety compliance</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">3. Information Sharing</h3>
                        <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Service Providers:</strong> Delivery personnel and technicians for service fulfillment</li>
                            <li><strong>Payment Processors:</strong> Financial institutions for payment processing</li>
                            <li><strong>Legal Authorities:</strong> When required by law or court order</li>
                            <li><strong>Safety Agencies:</strong> For compliance and emergency response</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">4. Data Security</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Encryption:</strong> All passwords and sensitive data are encrypted</li>
                            <li><strong>Secure Storage:</strong> Data stored on secure servers with limited access</li>
                            <li><strong>Regular Updates:</strong> Security measures regularly reviewed and updated</li>
                            <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
                            <li><strong>Monitoring:</strong> 24/7 security monitoring and threat detection</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">5. Cookies and Tracking</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Essential Cookies:</strong> Required for basic site functionality</li>
                            <li><strong>Analytics Cookies:</strong> To understand site usage and improve services</li>
                            <li><strong>Marketing Cookies:</strong> With your consent for promotional purposes</li>
                            <li><strong>Control:</strong> You can control cookie preferences in your browser</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">6. Your Rights</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Access:</strong> Right to access and update your personal information</li>
                            <li><strong>Correction:</strong> Right to correct inaccurate information</li>
                            <li><strong>Deletion:</strong> Right to request deletion of your personal data</li>
                            <li><strong>Portability:</strong> Right to transfer data to other services</li>
                            <li><strong>Restriction:</strong> Right to limit processing of your personal data</li>
                            <li><strong>Complaint:</strong> Right to file complaints with data protection authorities</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">7. Data Retention</h3>
                        <p>We retain your personal information only as long as necessary for the purposes outlined in this policy:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Account Information:</strong> Until account is deleted</li>
                            <li><strong>Transaction Records:</strong> 7 years for legal and tax purposes</li>
                            <li><strong>Support Communications:</strong> 2 years for quality assurance</li>
                            <li><strong>Marketing Data:</strong> Until you withdraw consent</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">8. Children's Privacy</h3>
                        <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information immediately.</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">9. International Users</h3>
                        <p>If you are accessing our services from outside the Philippines, your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with international data transfer standards.</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">10. Changes to This Policy</h3>
                        <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on our website and sending you an email notification. Your continued use of our services constitutes acceptance of the updated policy.</p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">11. Contact Us</h3>
                        <p>If you have any questions about this privacy policy, please contact us:</p>
                        <div className="font-medium">
                            <p>📧 Email: privacy@mvoxygen.com</p>
                            <p>📞 Phone: (044) 123-4567</p>
                            <p>📍 Address: PWS 049, Rizal Street, Poblacion West, General Tinio, Nueva Ecija</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">12. Effective Date</h3>
                        <p>This privacy policy is effective as of May 3, 2026.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
