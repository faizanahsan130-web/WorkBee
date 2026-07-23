document.addEventListener('DOMContentLoaded', () => {
    const sellerRows = document.querySelectorAll('.orders-table tbody tr');

    sellerRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.background = '#f8fafc';
        });
        row.addEventListener('mouseleave', () => {
            row.style.background = 'transparent';
        });
    });
});