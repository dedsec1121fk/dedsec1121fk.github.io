(function () {
    'use strict';

    const CONSENT_COOKIE = 'dedsec_cookie_consent_v1';
    const CONSENT_STORAGE = 'dedsec_cookie_consent_v1';
    const GTM_ID = 'GTM-WHHS4XN9';
    const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;
    let gtmLoaded = false;
    let detailsOpen = false;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 500
    });

    function isGreek() {
        const lang = (document.documentElement.lang || '').toLowerCase();
        return lang === 'el' || lang === 'gr' || window.location.pathname.startsWith('/el/');
    }

    const copy = {
        en: {
            title: 'Cookie Choices',
            intro: 'One necessary cookie remembers your choice. Analytics stays off unless you accept it.',
            accept: 'Accept analytics',
            decline: 'Decline analytics',
            details: 'See cookie details',
            hideDetails: 'Hide cookie details',
            settings: 'Cookie Settings',
            necessaryTitle: 'Necessary cookie — always active',
            necessaryText: 'dedsec_cookie_consent_v1: stores whether you accepted or declined analytics for up to 12 months. It is shared across ded-sec.space and its subdomains so the banner does not reappear on each subdomain.',
            analyticsTitle: 'Google Analytics — optional',
            analyticsText: 'Loaded only after acceptance through Google Tag Manager. Depending on the active Google configuration, cookies such as _ga, _ga_*, _gid or _gat* may be used. Measurement may include page URL and title, referrer, visit time, clicks or other configured interactions, browser/device information, and approximate region-level data.',
            declinedText: 'When declined, the Google Tag Manager script is not requested and analytics cookies are not created by this website.',
            privacy: 'Read the full Privacy Policy',
            savedAccepted: 'Analytics accepted.',
            savedDeclined: 'Analytics declined.'
        },
        gr: {
            title: 'Επιλογές cookies',
            intro: 'Ένα απαραίτητο cookie θυμάται την επιλογή σου. Τα analytics μένουν κλειστά μέχρι να τα αποδεχτείς.',
            accept: 'Αποδοχή αναλυτικών',
            decline: 'Απόρριψη αναλυτικών',
            details: 'Προβολή λεπτομερειών cookies',
            hideDetails: 'Απόκρυψη λεπτομερειών',
            settings: 'Ρυθμίσεις Cookies',
            necessaryTitle: 'Απαραίτητο cookie — πάντα ενεργό',
            necessaryText: 'dedsec_cookie_consent_v1: αποθηκεύει αν αποδέχτηκες ή απέρριψες τα αναλυτικά στοιχεία για έως 12 μήνες. Κοινοποιείται στο ded-sec.space και στα subdomains του, ώστε το banner να μην εμφανίζεται ξανά σε κάθε subdomain.',
            analyticsTitle: 'Google Analytics — προαιρετικό',
            analyticsText: 'Φορτώνεται μόνο μετά από αποδοχή μέσω του Google Tag Manager. Ανάλογα με την ενεργή ρύθμιση της Google, μπορεί να χρησιμοποιηθούν cookies όπως _ga, _ga_*, _gid ή _gat*. Η μέτρηση μπορεί να περιλαμβάνει URL και τίτλο σελίδας, referrer, χρόνο επίσκεψης, κλικ ή άλλες ρυθμισμένες αλληλεπιδράσεις, στοιχεία browser/συσκευής και κατά προσέγγιση δεδομένα περιοχής.',
            declinedText: 'Με την απόρριψη, το script του Google Tag Manager δεν ζητείται και η ιστοσελίδα δεν δημιουργεί cookies αναλυτικών στοιχείων.',
            privacy: 'Διάβασε ολόκληρη την Πολιτική Απορρήτου',
            savedAccepted: 'Τα αναλυτικά στοιχεία έγιναν αποδεκτά.',
            savedDeclined: 'Τα αναλυτικά στοιχεία απορρίφθηκαν.'
        }
    };

    function text() {
        return isGreek() ? copy.gr : copy.en;
    }

    function cookieDomainPart() {
        const hostname = window.location.hostname.toLowerCase();
        if (hostname === 'ded-sec.space' || hostname.endsWith('.ded-sec.space')) {
            return '; Domain=.ded-sec.space';
        }
        return '';
    }

    function readCookie() {
        const prefix = CONSENT_COOKIE + '=';
        const parts = document.cookie ? document.cookie.split(';') : [];
        for (const part of parts) {
            const value = part.trim();
            if (value.startsWith(prefix)) return decodeURIComponent(value.slice(prefix.length));
        }
        return null;
    }

    function getConsent() {
        const cookieValue = readCookie();
        if (cookieValue === 'accepted' || cookieValue === 'declined') return cookieValue;
        try {
            const localValue = window.localStorage.getItem(CONSENT_STORAGE);
            return localValue === 'accepted' || localValue === 'declined' ? localValue : null;
        } catch (_) {
            return null;
        }
    }

    function saveConsent(value) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = CONSENT_COOKIE + '=' + encodeURIComponent(value) +
            '; Path=/; Max-Age=' + CONSENT_MAX_AGE + '; SameSite=Lax' + secure + cookieDomainPart();
        try {
            window.localStorage.setItem(CONSENT_STORAGE, value);
        } catch (_) {
            // The first-party cookie remains the primary cross-subdomain preference store.
        }
    }

    function deleteAnalyticsCookies() {
        const names = document.cookie.split(';').map(function (part) {
            return part.split('=')[0].trim();
        }).filter(function (name) {
            return /^(_ga|_gid|_gat|_gcl_au)/.test(name);
        });
        const domains = ['', '; Domain=.ded-sec.space', '; Domain=ded-sec.space'];
        names.forEach(function (name) {
            domains.forEach(function (domain) {
                document.cookie = name + '=; Path=/; Max-Age=0; SameSite=Lax' + domain;
            });
        });
    }

    function loadGtm() {
        if (gtmLoaded || document.querySelector('script[data-dedsec-gtm]')) return;
        gtmLoaded = true;
        window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
        const script = document.createElement('script');
        script.async = true;
        script.dataset.dedsecGtm = 'true';
        script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
        document.head.appendChild(script);
    }

    function disableAnalytics() {
        window.gtag('consent', 'update', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        deleteAnalyticsCookies();
    }

    function injectStyles() {
        if (document.getElementById('dedsec-cookie-styles')) return;
        const style = document.createElement('style');
        style.id = 'dedsec-cookie-styles';
        style.textContent = `
            .dedsec-cookie-banner{position:fixed;z-index:2147483646;left:16px;right:16px;bottom:16px;max-width:920px;margin:auto;padding:20px;border:1px solid rgba(123,97,255,.55);border-radius:18px;background:rgba(8,7,18,.98);color:#f5f3ff;box-shadow:0 18px 70px rgba(0,0,0,.55);font-family:inherit;line-height:1.55;backdrop-filter:blur(14px)}
            .dedsec-cookie-banner[hidden]{display:none!important}.dedsec-cookie-banner h2{margin:0 0 8px;font-size:1.35rem;color:#fff}.dedsec-cookie-banner p{margin:0;color:#ddd8f7}.dedsec-cookie-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.dedsec-cookie-btn{appearance:none;border:1px solid rgba(164,146,255,.7);border-radius:999px;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer;background:#18142c;color:#fff;min-height:44px}.dedsec-cookie-btn:hover,.dedsec-cookie-btn:focus-visible{transform:translateY(-1px);border-color:#fff;outline:2px solid transparent}.dedsec-cookie-btn--primary{background:linear-gradient(135deg,#5d45df,#8a54f6);border-color:transparent}.dedsec-cookie-btn--decline{background:#11101a}.dedsec-cookie-details{display:grid;gap:12px;margin-top:16px;padding-top:15px;border-top:1px solid rgba(255,255,255,.13)}.dedsec-cookie-details[hidden]{display:none!important}.dedsec-cookie-card{padding:13px;border-radius:12px;background:rgba(255,255,255,.055)}.dedsec-cookie-card strong{display:block;margin-bottom:5px;color:#fff}.dedsec-cookie-card p{font-size:.94rem}.dedsec-cookie-privacy{color:#bdafff;text-decoration:underline;text-underline-offset:3px}.dedsec-cookie-settings{position:fixed;z-index:2147483645;right:14px;bottom:14px;border:1px solid rgba(164,146,255,.6);border-radius:999px;padding:9px 13px;background:rgba(8,7,18,.94);color:#fff;font:inherit;font-size:.82rem;font-weight:700;line-height:1.1;text-align:center;white-space:normal;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.38);transform:scale(.9);transform-origin:bottom right}.dedsec-cookie-settings[hidden]{display:none!important}.dedsec-cookie-status{position:fixed;z-index:2147483647;left:50%;bottom:20px;transform:translateX(-50%);padding:10px 14px;border-radius:999px;background:#12101f;color:#fff;box-shadow:0 10px 34px rgba(0,0,0,.45);font:inherit;font-weight:700}.dedsec-cookie-status[hidden]{display:none!important}@media(max-width:620px){.dedsec-cookie-banner{left:8px;right:8px;bottom:8px;padding:13px;max-height:calc(100vh - 16px);overflow:auto;border-radius:14px;line-height:1.35}.dedsec-cookie-banner h2{font-size:1.08rem;margin-bottom:5px}.dedsec-cookie-banner>p{font-size:.82rem}.dedsec-cookie-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:11px}.dedsec-cookie-btn{width:100%;min-height:40px;padding:8px 7px;border-radius:10px;font-size:.78rem}.dedsec-cookie-btn[data-cookie-details]{grid-column:1/-1}.dedsec-cookie-details{gap:8px;margin-top:11px;padding-top:10px}.dedsec-cookie-card{padding:10px}.dedsec-cookie-card p,.dedsec-cookie-details>p{font-size:.78rem}.dedsec-cookie-settings{right:8px;bottom:8px}}
        `;
        document.head.appendChild(style);
    }

    function privacyUrl() {
        return isGreek() ? '/el/Pages/privacy-policy.html' : '/Pages/privacy-policy.html';
    }

    function createInterface() {
        injectStyles();
        const t = text();
        const banner = document.createElement('section');
        banner.className = 'dedsec-cookie-banner';
        banner.id = 'dedsec-cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'true');
        banner.setAttribute('aria-labelledby', 'dedsec-cookie-title');
        banner.innerHTML = `
            <h2 id="dedsec-cookie-title"></h2>
            <p data-cookie-intro></p>
            <div class="dedsec-cookie-actions">
                <button class="dedsec-cookie-btn dedsec-cookie-btn--primary" type="button" data-cookie-accept></button>
                <button class="dedsec-cookie-btn dedsec-cookie-btn--decline" type="button" data-cookie-decline></button>
                <button class="dedsec-cookie-btn" type="button" data-cookie-details aria-expanded="false"></button>
            </div>
            <div class="dedsec-cookie-details" data-cookie-details-panel hidden>
                <div class="dedsec-cookie-card"><strong data-cookie-necessary-title></strong><p data-cookie-necessary-text></p></div>
                <div class="dedsec-cookie-card"><strong data-cookie-analytics-title></strong><p data-cookie-analytics-text></p></div>
                <p data-cookie-declined-text></p>
                <a class="dedsec-cookie-privacy" data-cookie-privacy></a>
            </div>`;

        const settings = document.createElement('button');
        settings.className = 'dedsec-cookie-settings';
        settings.type = 'button';
        settings.setAttribute('aria-controls', 'dedsec-cookie-banner');

        const status = document.createElement('div');
        status.className = 'dedsec-cookie-status';
        status.setAttribute('role', 'status');
        status.hidden = true;

        document.body.appendChild(banner);
        document.body.appendChild(settings);
        document.body.appendChild(status);

        function updateLanguage() {
            const current = text();
            banner.querySelector('#dedsec-cookie-title').textContent = current.title;
            banner.querySelector('[data-cookie-intro]').textContent = current.intro;
            banner.querySelector('[data-cookie-accept]').textContent = current.accept;
            banner.querySelector('[data-cookie-decline]').textContent = current.decline;
            banner.querySelector('[data-cookie-details]').textContent = detailsOpen ? current.hideDetails : current.details;
            banner.querySelector('[data-cookie-necessary-title]').textContent = current.necessaryTitle;
            banner.querySelector('[data-cookie-necessary-text]').textContent = current.necessaryText;
            banner.querySelector('[data-cookie-analytics-title]').textContent = current.analyticsTitle;
            banner.querySelector('[data-cookie-analytics-text]').textContent = current.analyticsText;
            banner.querySelector('[data-cookie-declined-text]').textContent = current.declinedText;
            const privacy = banner.querySelector('[data-cookie-privacy]');
            privacy.textContent = current.privacy;
            privacy.href = privacyUrl();
            settings.replaceChildren();
            current.settings.split(/\s+/).forEach(function (word, index) {
                if (index > 0) settings.appendChild(document.createElement('br'));
                settings.appendChild(document.createTextNode(word));
            });
            settings.setAttribute('aria-label', current.settings);
        }

        function announce(message) {
            status.textContent = message;
            status.hidden = false;
            window.setTimeout(function () { status.hidden = true; }, 2400);
        }

        function openBanner() {
            banner.hidden = false;
            settings.hidden = true;
            updateLanguage();
            window.setTimeout(function () {
                banner.querySelector('[data-cookie-accept]').focus();
            }, 0);
        }

        function closeBanner() {
            banner.hidden = true;
            settings.hidden = false;
        }

        banner.querySelector('[data-cookie-details]').addEventListener('click', function () {
            detailsOpen = !detailsOpen;
            const panel = banner.querySelector('[data-cookie-details-panel]');
            panel.hidden = !detailsOpen;
            this.setAttribute('aria-expanded', String(detailsOpen));
            updateLanguage();
        });

        banner.querySelector('[data-cookie-accept]').addEventListener('click', function () {
            saveConsent('accepted');
            loadGtm();
            closeBanner();
            announce(text().savedAccepted);
            document.dispatchEvent(new CustomEvent('dedsec:consent-changed', { detail: { analytics: true } }));
        });

        banner.querySelector('[data-cookie-decline]').addEventListener('click', function () {
            const hadLoadedAnalytics = gtmLoaded;
            saveConsent('declined');
            disableAnalytics();
            closeBanner();
            announce(text().savedDeclined);
            document.dispatchEvent(new CustomEvent('dedsec:consent-changed', { detail: { analytics: false } }));
            if (hadLoadedAnalytics) {
                window.setTimeout(function () { window.location.reload(); }, 450);
            }
        });

        settings.addEventListener('click', openBanner);

        document.addEventListener('click', function (event) {
            const trigger = event.target.closest('[data-cookie-settings]');
            if (!trigger) return;
            event.preventDefault();
            openBanner();
        });

        const observer = new MutationObserver(updateLanguage);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

        updateLanguage();
        const consent = getConsent();
        if (consent === 'accepted') {
            banner.hidden = true;
            settings.hidden = false;
            loadGtm();
        } else if (consent === 'declined') {
            banner.hidden = true;
            settings.hidden = false;
            disableAnalytics();
        } else {
            settings.hidden = true;
            openBanner();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createInterface, { once: true });
    } else {
        createInterface();
    }
}());
