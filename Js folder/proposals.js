// proposals.js
function handleProposal(action, buttonElement) {
    const card = buttonElement.closest('.proposal-card');
    if (action === 'Accept') {
        alert('Proposal Accepted Successfully!');
    } else {
        alert('Proposal Rejected.');
    }
    card.style.opacity = '0.5';
    card.style.pointerEvents = 'none';
}