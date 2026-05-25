// --- MAXIMIZE MODAL LOGIC ---
function openVisualModal(buttonElement) {
    const modal = document.getElementById('visual-modal');
    const modalImage = document.getElementById('modal-image');
    
    // 1. Find the image that belongs to this specific tile
    const sourceImage = buttonElement.closest('.visual-inner').querySelector('img');
    
    // 2. Pass the source image to the modal
    modalImage.src = sourceImage.src;
    
    // 3. Open the modal
    modal.classList.add('open');
    
    // 4. Temporarily disable main body scroll while viewing
    document.body.style.overflow = 'hidden';
}

function closeVisualModal() {
    const modal = document.getElementById('visual-modal');
    modal.classList.remove('open');
    
    // Re-enable scroll
    document.body.style.overflow = '';
}


function switchPdf(event, docId) {
    // 1. Hide all tab content
    const contents = document.querySelectorAll('.pdf-tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // 2. Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.pdf-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. Show the selected content and mark button as active
    document.getElementById(docId).classList.add('active');
    event.currentTarget.classList.add('active');
}