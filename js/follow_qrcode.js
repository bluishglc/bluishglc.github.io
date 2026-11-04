/**
 * The QR code dialog of the follow button of the profile widget (layout/widget/profile.jsx): opened by
 * the button, closed by its background, its close button or Escape. The listeners are on the document,
 * once, so that they keep working on the pages that PJAX loads, which run this script again.
 */
(function() {
    if (window.__followQrcode) {
        return;
    }
    window.__followQrcode = true;

    const root = document.documentElement;

    // The page does not scroll under the dialog (is-clipped: overflow hidden), which hides the scrollbar:
    // its width is kept as a padding, so that the page does not move when the dialog opens and closes
    function lockScroll() {
        if (root.classList.contains('is-clipped')) {
            return;
        }
        const scrollbarWidth = window.innerWidth - root.clientWidth;
        if (scrollbarWidth > 0) {
            root.style.paddingRight = scrollbarWidth + 'px';
        }
        root.classList.add('is-clipped');
    }

    function unlockScroll() {
        root.classList.remove('is-clipped');
        root.style.paddingRight = '';
    }

    function close() {
        const opened = document.querySelectorAll('.follow-qrcode-modal.is-active');
        if (!opened.length) {
            return;
        }
        opened.forEach(modal => {
            modal.classList.remove('is-active');
        });
        unlockScroll();
    }

    function open(id) {
        const modal = document.getElementById(id);
        if (!modal) {
            return;
        }
        // Under <body>: a fixed dialog in the sidebar would be clipped or moved by its sticky columns.
        // The dialogs of the pages left by PJAX are removed first.
        if (modal.parentNode !== document.body) {
            document.querySelectorAll('body > .follow-qrcode-modal').forEach(old => old.remove());
            document.body.appendChild(modal);
        }
        lockScroll();
        modal.classList.add('is-active');
    }

    document.addEventListener('click', event => {
        const button = event.target.closest('[data-follow-qrcode]');
        if (button) {
            event.preventDefault();
            open(button.getAttribute('data-follow-qrcode'));
        } else if (event.target.closest('[data-follow-qrcode-close]')) {
            close();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            close();
        }
    });
}());
