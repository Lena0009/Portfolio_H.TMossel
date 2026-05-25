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