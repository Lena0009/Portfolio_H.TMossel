// citations.js

export function initProjectCitations() {
    const preview = document.createElement('div');
    preview.id = 'project-hover-preview';
    preview.innerHTML = `
        <div class="hover-row-layout">
            <div class="hover-preview-image-container">
                <img class="hover-preview-image" src="" alt="">
            </div>
            <div class="hover-preview-content">
                <div class="hover-preview-title"></div>
                <div class="js-project-tags"></div>
                <div class="hover-preview-description"></div> 
            </div>
        </div>
    `;
    document.body.appendChild(preview);

    const citations = document.querySelectorAll('.project-citation');

    citations.forEach(cite => {
        cite.addEventListener('mouseenter', async () => {
            const projectFile = cite.getAttribute('data-project');
            const url = `./projects/${projectFile}`;

            try {
                const response = await fetch(url);
                const htmlText = await response.text();
                const doc = new DOMParser().parseFromString(htmlText, 'text/html');

                // Extract data
                const title = doc.querySelector('.js-project-title')?.innerText || "Untitled";
                const thumb = doc.querySelector('.js-project-thumbnail')?.src || "";
                const tags = doc.querySelector('.js-project-tags')?.innerHTML || "";
                const description = doc.querySelector('.js-project-card-description')?.innerText || "";

                // Inject into preview
                preview.querySelector('.hover-preview-title').innerText = title;
                preview.querySelector('.hover-preview-image').src = thumb;
                preview.querySelector('.js-project-tags').innerHTML = tags;
                preview.querySelector('.hover-preview-description').innerText = description;

                preview.classList.add('visible');
            } catch (err) {
                console.error("Preview fetch failed", err);
            }
        });

        cite.addEventListener('mousemove', (e) => {
            const margin = 20;
            const pWidth = preview.offsetWidth;
            const pHeight = preview.offsetHeight;
            
            // Check right edge
            let x = e.clientX + margin;
            if (x + pWidth > window.innerWidth) {
                x = e.clientX - pWidth - margin;
            }

            // Check bottom edge
            let y = e.clientY + margin;
            if (y + pHeight > window.innerHeight) {
                y = e.clientY - pHeight - margin;
            }
            
            // Check top edge (if it flips up and hits the top)
            if (y < 0) y = margin;

            preview.style.left = `${x}px`;
            preview.style.top = `${y}px`;
        });

        cite.addEventListener('mouseleave', () => {
            preview.classList.remove('visible');
        });

        // If they click the citation, just open the sidebar like a card would
        cite.addEventListener('click', () => {
            const projectFile = cite.getAttribute('data-project');
            if (window.openProjectSidebar) {
                window.openProjectSidebar(`./projects/${projectFile}`);
            }
        });
    });
}