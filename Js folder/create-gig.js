document.addEventListener('DOMContentLoaded', () => {
    const gigForm = document.querySelector('form');

    if (gigForm) {
        gigForm.addEventListener('submit', (e) => {
            // Aap yahan chahein toh custom validation ya success message add kar sakte hain
            console.log('Gig published successfully!');
        });
    }
});