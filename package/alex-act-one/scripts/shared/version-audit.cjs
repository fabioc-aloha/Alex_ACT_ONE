'use strict';

function stableParts(value, label) {
    if (typeof value !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) {
        throw new Error(`${label} must be one stable version, not prerelease or malformed metadata`);
    }
    const parts = value.split('.').map(Number);
    if (!parts.every(Number.isSafeInteger)) throw new Error(`${label} contains an invalid version number`);
    return parts;
}

function auditVersion(pinned, metadata) {
    if (Array.isArray(metadata)) {
        if (metadata.length !== 1) throw new Error('Registry latest metadata must contain exactly one version');
        metadata = metadata[0];
    }
    const current = stableParts(pinned, 'Source pin');
    const latest = stableParts(metadata, 'Registry latest');
    const difference = latest.map((part, index) => part - current[index]).find(value => value !== 0) || 0;
    if (difference < 0) throw new Error(`Registry latest ${metadata} is older than source pin ${pinned}`);
    return { latest: metadata, status: difference === 0 ? 'current' : 'update' };
}

module.exports = { auditVersion };
