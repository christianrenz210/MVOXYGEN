// Test contact number validation function
function validateContactNumber(number) {
    // Remove all non-digit characters
    const digitsOnly = number.replace(/\D/g, '');
    
    // Check if it starts with 09 and has exactly 10 digits
    if (digitsOnly.length === 0) {
        return { isValid: false, formatted: '', error: '' };
    }
    
    if (digitsOnly.length < 10) {
        return { isValid: false, formatted: number, error: 'Contact number must be 10 digits' };
    }
    
    if (digitsOnly.length > 10) {
        return { isValid: false, formatted: number, error: 'Contact number must be exactly 10 digits' };
    }
    
    if (!digitsOnly.startsWith('09')) {
        return { isValid: false, formatted: number, error: 'Contact number must start with 09' };
    }
    
    // Format as 09XX-XXX-XXXX
    const formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
    return { isValid: true, formatted };
}

// Test cases
const testCases = [
    '0912345678', // Valid
    '0998765432', // Valid
    '0912-345-678', // Valid with dashes
    '0912 345 678', // Valid with spaces
    '091234567', // Too short
    '09123456789', // Too long
    '0812345678', // Doesn't start with 09
    '091234567a', // Contains letter
    '+63912345678', // International format
    '912345678', // Missing leading 0
    '', // Empty
];

console.log('=== Contact Number Validation Test ===\n');

testCases.forEach((testCase, index) => {
    const result = validateContactNumber(testCase);
    console.log(`Test ${index + 1}: "${testCase}"`);
    console.log(`  Valid: ${result.isValid}`);
    console.log(`  Formatted: "${result.formatted}"`);
    if (result.error) {
        console.log(`  Error: ${result.error}`);
    }
    console.log('');
});

console.log('=== Expected Display Format ===');
console.log('Input field shows: +63 [09XX-XXX-XXXX]');
console.log('User types: 9123456789');
console.log('Auto-formats to: 0912-345-6789');
console.log('Stored as: 0912-345-6789');
console.log('Display shows: +63 0912-345-6789');
