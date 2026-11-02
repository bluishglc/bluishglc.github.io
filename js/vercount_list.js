/**
 * Views of each post on the index pages (layout/common/article.jsx), read from Vercount by the URL of
 * the post without counting a view: the posts count their own views by the Vercount script on their
 * pages. A counter is shown once its number is read, and stays hidden when the request fails.
 */
(function() {
    const API_URL = 'https://events.vercount.one/api/v2/log';

    function load() {
        document.querySelectorAll('[data-vercount-url]').forEach(element => {
            let url;
            try {
                // The URL as the browser has it on the page of the post (percent-encoded)
                url = new URL(element.getAttribute('data-vercount-url'), location.href).href;
            } catch (e) {
                return;
            }
            fetch(API_URL + '?url=' + encodeURIComponent(url))
                .then(response => (response.ok ? response.json() : null))
                .then(result => {
                    const views = result && result.data ? result.data.page_pv : null;
                    const value = element.querySelector('.vercount-page-pv');
                    if (views === null || views === undefined || !value) {
                        return;
                    }
                    value.textContent = String(views);
                    element.style.display = '';
                })
                .catch(() => {
                    // Keep the counter hidden
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load, { once: true });
    } else {
        load();
    }
}());
