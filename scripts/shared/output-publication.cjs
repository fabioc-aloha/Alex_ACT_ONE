'use strict';

const fs = require('node:fs');
const path = require('node:path');

function publishFiles(files) {
    const names = new Set();
    const entries = files.map(file => {
        const destination = path.resolve(file.destination);
        const key = process.platform === 'win32' ? destination.toLowerCase() : destination;
        if (names.has(key)) throw new Error(`Duplicate output destination: ${destination}`);
        names.add(key);
        return { source: file.source, destination };
    });
    const prepared = [];
    const committed = [];
    const createdDirectories = new Set();
    let retainBackups = false;
    try {
        for (const entry of entries) {
            if (!fs.statSync(entry.source).isFile()) throw new Error(`Staged output is not a regular file: ${entry.source}`);
            const exists = fs.existsSync(entry.destination);
            if (exists && !fs.lstatSync(entry.destination).isFile()) {
                throw new Error(`Output destination is not a regular file: ${entry.destination}`);
            }
            const parent = path.dirname(entry.destination);
            const missing = [];
            for (let directory = parent; !fs.existsSync(directory); directory = path.dirname(directory)) {
                if (directory === path.dirname(directory)) throw new Error(`Output root does not exist: ${directory}`);
                missing.push(directory);
            }
            fs.mkdirSync(parent, { recursive: true });
            for (const directory of missing) createdDirectories.add(directory);
            const staging = fs.mkdtempSync(path.join(parent, '.alex-output-'));
            const next = path.join(staging, 'new');
            const backup = exists ? path.join(staging, 'prior') : null;
            prepared.push({ ...entry, staging, next, backup });
            fs.copyFileSync(entry.source, next);
            if (backup) fs.copyFileSync(entry.destination, backup);
        }
        for (const entry of prepared) {
            fs.renameSync(entry.next, entry.destination);
            committed.push(entry);
        }
    } catch (error) {
        const recoveryErrors = [];
        for (const entry of committed.reverse()) {
            try {
                if (entry.backup) fs.renameSync(entry.backup, entry.destination);
                else fs.unlinkSync(entry.destination);
            } catch (recoveryError) {
                recoveryErrors.push(recoveryError);
            }
        }
        if (recoveryErrors.length) {
            retainBackups = true;
            throw new AggregateError([error, ...recoveryErrors],
                `Output rollback incomplete; recovery copies retained at ${prepared.map(entry => entry.staging).join(', ')}`);
        }
        throw error;
    } finally {
        if (!retainBackups) {
            for (const entry of prepared) fs.rmSync(entry.staging, { recursive: true, force: true });
            for (const directory of [...createdDirectories].sort((left, right) => right.length - left.length)) {
                if (fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
            }
        }
    }
}

module.exports = { publishFiles };
