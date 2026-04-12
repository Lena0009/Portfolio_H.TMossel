// citations.js

export function initProjectCitations() {
    const preview = document.createElement('div');
    preview.id = 'project-hover-preview';
    preview.innerHTML = `
        <img class="hover-preview-image" src="" alt="">
        <div class="hover-preview-content">
            <div class="hover-preview-title"></div>
            <div class="js-project-tags"></div>
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

                // Inject into preview
                preview.querySelector('.hover-preview-title').innerText = title;
                preview.querySelector('.hover-preview-image').src = thumb;
                preview.querySelector('.js-project-tags').innerHTML = tags;

                preview.classList.add('visible');
            } catch (err) {
                console.error("Preview fetch failed", err);
            }
        });

        cite.addEventListener('mousemove', (e) => {
            // Position the preview 20px away from the mouse
            preview.style.left = `${e.clientX + 20}px`;
            preview.style.top = `${e.clientY + 20}px`;
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