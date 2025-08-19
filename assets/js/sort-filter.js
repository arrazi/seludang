document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.getElementById('feed-filter');
    const postFeed = document.querySelector('.gh-postfeed');
    const loadingIndicator = document.getElementById('loading-indicator');

    if (!filterSelect || !postFeed) return;

    filterSelect.addEventListener('change', async (e) => {
        const sortOption = e.target.value;
        const fetchUrl = new URL(window.apiUrl);

        // Map the user-friendly sort option to the correct Ghost API order parameter
        switch (sortOption) {
            case 'most-read':
                fetchUrl.searchParams.set('order', 'count.views desc');
                break;
            case 'random':
                // Ghost API does not have a native random sort.
                // We will use a simple workaround: fetching and shuffling posts.
                // This is not efficient for large sites, but works for now.
                // For a more robust solution, you would use a custom API endpoint.
                fetchUrl.searchParams.set('order', 'published_at desc');
                break;
            case 'newest':
            default:
                fetchUrl.searchParams.set('order', 'published_at desc');
                break;
        }

        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        postFeed.style.opacity = '0.5';

        try {
            const response = await fetch(fetchUrl);

            if (!response.ok) throw new Error('Network response was not ok');

            const { posts } = await response.json();
            
            // If sort is random, shuffle the array after fetching
            if (sortOption === 'random') {
                posts.sort(() => Math.random() - 0.5);
            }
            
            renderPosts(posts);
        } catch (error) {
            console.error('Fetch error:', error);
            postFeed.innerHTML = `<p class="gh-error">Error loading posts. Please try again.</p>`;
        } finally {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            postFeed.style.opacity = '1';
        }
    });

    const renderPosts = (posts) => {
        let html = '';
        posts.forEach(post => {
            const date = new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            html += `
                <article class="gh-card">
                    <a class="gh-card-link" href="${post.url}">
                        ${post.feature_image ? `
                            <img class="gh-card-image"
                                src="${post.feature_image}"
                                alt="${post.title}"
                                loading="lazy">` : ''
                        }
                        <div class="gh-card-content">
                            <h2 class="gh-card-title">${post.title}</h2>
                            <div class="gh-card-meta">
                                <time datetime="${post.published_at}">${date}</time>
                            </div>
                        </div>
                    </a>
                </article>
            `;
        });
        postFeed.innerHTML = html || `<p class="gh-empty">No posts found</p>`;
    };

    // Trigger initial sort to load posts based on default value
    if (filterSelect) {
        filterSelect.dispatchEvent(new Event('change'));
    }
});