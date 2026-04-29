const PAYMENT_METHODS = [
    { key: 'net', value: 'NET' },
    { key: 'meezan_bank', value: 'Meezan Bank' },
    { key: 'jazz_cash', value: 'JazzCash' },
    { key: 'easy_paisa', value: 'EasyPaisa' },
    { key: 'u_paisa', value: 'U-Paisa' },
    { key: 'naya_paisa', value: 'NayaPay' },
    { key: 'sada_pay', value: 'SadaPay' },
    { key: 'other', value: 'Other' },
    { key: 'pending', value: 'Pending' }
];

const STAFF_TYPES = {
    platformSuperAdmin: 'platformSuperAdmin',
    orgSuperAdmin: 'orgSuperAdmin',
    orgAdmin: 'orgAdmin',
    orgStaff: 'orgStaff',
}

module.exports = {
    PAYMENT_METHODS,
    STAFF_TYPES
}