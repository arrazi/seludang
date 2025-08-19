document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('imgur-tags-grid');
    const toggleButton = document.getElementById('imgur-more-tags');
    const sortSelect = document.getElementById('imgur-tags-sort');

    // Pastikan elemen-elemen ada sebelum melanjutkan
    if (!grid || !toggleButton || !sortSelect) {
        return;
    }

    // --- Fungsionalitas "Expand" ---
    let isExpanded = false;

    toggleButton.addEventListener('click', (event) => {
        event.preventDefault();
        isExpanded = !isExpanded;

        if (isExpanded) {
            grid.classList.add('expanded');
            toggleButton.textContent = 'LESS TAGS ×';
        } else {
            grid.classList.remove('expanded');
            toggleButton.textContent = 'MORE TAGS +';
        }
    });

    // --- Fungsionalitas "Sort By" ---
    sortSelect.addEventListener('change', async (event) => {
        const sortOrder = event.target.value;
        let order;

        if (sortOrder === 'posts') {
            order = 'count.posts desc';
        } else if (sortOrder === 'random') {
            order = 'RANDOM';
        }

        const apiKey = '8177d630d697e3b0c29c2ae82f'; // GANTI DENGAN KUNCI ANDA
        const url = `${window.location.protocol}//${window.location.hostname}/ghost/api/v4/content/tags/?key=${apiKey}&limit=all&order=${order}&include=count.posts`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch tags.');
            }
            const data = await response.json();
            renderTags(data.tags);
        } catch (error) {
            console.error(error);
        }
    });

    const renderTags = (tags) => {
        let html = '';
        tags.forEach(tag => {
            const accentColor = tag.accent_color || '#5E5E5E';
            const featureImage = tag.feature_image ? `<div class="imgur-tag-bg" style="background-image: url(${tag.feature_image});"></div>` : '';
            html += `
<a href="${tag.url}" class="imgur-tag-card" style="background-color: ${accentColor};">
${featureImage}
<div class="imgur-tag-overlay"></div>
<div class="imgur-tag-content">
<h3>${tag.name}</h3>
<p>${tag.count.posts} Posts</p>
</div>
</a>
`;
        });
        grid.innerHTML = html;
    };
});