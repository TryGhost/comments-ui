export const createPopupNotification = ({type, status, autoHide, duration = 2600, closeable, state, message, meta = {}}) => {
    let count = 0;
    if (state && state.popupNotification) {
        count = (state.popupNotification.count || 0) + 1;
    }
    return {
        type,
        status,
        autoHide,
        closeable,
        duration,
        meta,
        message,
        count
    };
};

export function transformApiSiteData({site}) {
    if (!site) {
        return null;
    }

    return site;
}

export function isSentryEventAllowed({event: sentryEvent}) {
    const frames = sentryEvent?.exception?.values?.[0]?.stacktrace?.frames || [];
    const fileNames = frames.map(frame => frame.filename).filter(filename => !!filename);
    const lastFileName = fileNames[fileNames.length - 1] || '';
    return lastFileName.includes('@tryghost/comments');
}

export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    // Diff is in seconds
    let diff = Math.round((now.getTime() - date.getTime()) / 1000);
    if (diff < 5) {
        return 'Just now';
    }

    if (diff < 60) {
        return `${diff} seconds ago`;
    }

    // Diff in minutes
    diff = diff / 60;
    if (diff < 60) {
        if (Math.floor(diff) === 1) {
            return `One minute ago`;
        }
        return `${Math.floor(diff)} minutes ago`;
    }

    // First check for yesterday 
    // (we ignore setting 'yesterday' if close to midnight and keep using minutes until 1 hour difference)
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (date.getFullYear() === yesterday.getFullYear() && date.getMonth() === yesterday.getMonth() && date.getDate() === yesterday.getDate()) {
        return 'Yesterday';
    }

    // Diff in hours
    diff = diff / 60;
    if (diff < 24) {
        if (Math.floor(diff) === 1) {
            return `One hour ago`;
        }
        return `${Math.floor(diff)} hours ago`;
    }

    // Diff in days
    diff = diff / 24;
    if (diff < 7) {
        if (Math.floor(diff) === 1) {
            // Special case, we should compare based on dates in the future instead
            return `One day ago`;
        }
        return `${Math.floor(diff)} days ago`;
    }

    // Diff in weeks
    diff = diff / 7;
    if (Math.floor(diff) === 1) {
        // Special case, we should compare based on dates in the future instead
        return `One week ago`;
    }
    return `${Math.floor(diff)} weeks ago`;
}

export function getInitials(name) {
    if (!name) {
        return '';
    }
    const parts = name.split(' ');

    if (parts.length === 0) {
        return '';
    }

    if (parts.length === 1) {
        return parts[0].substring(0, 1).toLocaleUpperCase();
    }

    return parts[0].substring(0, 1).toLocaleUpperCase() + parts[parts.length - 1].substring(0, 1).toLocaleUpperCase();
}

// Keep a reference outside, because document.currentScript is only returned on the initial script load.
const currentScript = document.currentScript;

export function getBundledCssLink({appVersion}) {
    if (process.env.NODE_ENV === 'production' && appVersion) {
        return `https://unpkg.com/@tryghost/comments-ui@~${appVersion}/umd/main.css`;
    } else {
        if (currentScript) {
            // Dynamically determine the current path
            const url = new URL(currentScript.src);
            return url.origin + '/main.css';
        }
        return 'http://localhost:4000/main.css';
    }
}

// Rudimentary check for screen width
// Note, this should be the same as breakpoint defined in Tailwind config
export function isMobile() {
    return (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 480);
}