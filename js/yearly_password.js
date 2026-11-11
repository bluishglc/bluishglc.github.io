/**
 * Opens the posts that share the password of their year (scripts/encrypt_form.js): the password that
 * opens one of them is kept in the browser, and fills the form of the others of that year. A password
 * that no longer opens a post is dropped without a message, and the form waits for the new one. The
 * "forget" button of the plugin drops it too. The listeners are set once, as PJAX runs this script again.
 */
(function() {
    if (!window.__yearlyPassword) {
        const PREFIX = 'yearly_password.';
        // The password in the form when it was sent, and its year
        let sent = null;

        const pageYear = function() {
            const element = document.querySelector('[data-yearly-password]');
            return element ? element.getAttribute('data-yearly-password') : null;
        };
        // localStorage throws in the browsers and modes that do not allow it
        const storage = function(action, year, value) {
            try {
                return localStorage[action](PREFIX + year, value);
            } catch (e) {
                return null;
            }
        };

        document.addEventListener('submit', function(event) {
            const year = pageYear();
            const field = event.target.querySelector('input[type="password"]');
            if (year && field && event.target.closest('#hexo-blog-encrypt')) {
                sent = { year: year, password: field.value };
            }
        }, true);

        window.addEventListener('hexo-blog-decrypt', function() {
            if (sent && sent.password) {
                storage('setItem', sent.year, sent.password);
            }
            sent = null;
        });

        document.addEventListener('click', function(event) {
            const year = pageYear();
            if (year && event.target.closest && event.target.closest('.hbe-forget-button')) {
                storage('removeItem', year);
            }
        }, true);

        const fill = function(element, year, password) {
            const form = element.querySelector('form');
            const field = element.querySelector('input[type="password"]');
            const alert = element.querySelector('[role="alert"]');
            if (!form || !field) {
                return;
            }
            if (alert) {
                const observer = new MutationObserver(function() {
                    if (alert.textContent) {
                        observer.disconnect();
                        storage('removeItem', year);
                        alert.textContent = '';
                        field.value = '';
                        field.dispatchEvent(new Event('input'));
                    }
                });
                observer.observe(alert, { childList: true, characterData: true, subtree: true });
            }
            field.value = password;
            field.dispatchEvent(new Event('input'));
            form.requestSubmit();
        };

        window.__yearlyPassword = function() {
            const element = document.getElementById('hexo-blog-encrypt');
            const year = pageYear();
            // Without the format, it is the decrypted content
            if (!year || !element || !element.dataset.hbeFormat || element.__yearlyPassword) {
                return;
            }
            const password = storage('getItem', year);
            // A post with its own saved key opens by itself
            let saved = null;
            try {
                saved = localStorage.getItem('hbe.v4.' + location.pathname + location.search);
            } catch (e) { /* the same as without a key */ }
            if (!password || saved) {
                return;
            }
            element.__yearlyPassword = true;
            // The plugin may not have set up the form yet: its init does nothing if it has
            window.hexoBlogEncrypt.init();
            fill(element, year, password);
        };
    }

    const run = function(tries) {
        if (window.hexoBlogEncrypt) {
            window.__yearlyPassword();
        } else if (tries > 0) {
            setTimeout(run, 100, tries - 1);
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            run(20);
        });
    } else {
        run(20);
    }
}());
