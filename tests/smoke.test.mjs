// @ts-check
/**
 * Smoke tests for the package's own structural claims.
 *
 * Every assertion here corresponds to something the package states publicly —
 * in the README, the manifest, or a skill — that nothing previously checked.
 * The prompt for writing them was a real defect: `runtime-launcher.mjs` guarded
 * against `@playwright/mcp` 0.0.78 while the reviewed pin and the provisioned
 * runtime were both 0.0.80, so the version guard exited 4 on every launch and
 * the Playwright MCP server could not start on any host. It went unnoticed
 * because `check-dependencies` inspects the pin table rather than the launcher,
 * and so reported "Playwright ok" throughout.
 *
 * Run: node --test tests/
 *
 * No dependencies and no package.json: the package's claim is that it runs on
 * Node alone, and a test suite that needed a framework would undercut it.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');
const readJson = (...p) => JSON.parse(read(...p));

const manifest = readJson('manifest.json');
const pluginJson = readJson('plugin.json');
const { MCP_SERVERS } = require(join(ROOT, 'scripts', 'shared', 'dependencies.cjs'));

const LAUNCHER_REL = join('skills', 'setup-dependencies', 'scripts', 'runtime-launcher.mjs');
const launcherSource = read(LAUNCHER_REL);

/** Routes and their guarded versions, as the launcher itself declares them. */
function launcherRoutes() {
    const routes = {};
    const block = /(\w+)\s*:\s*\{\s*expectedVersion:\s*'([^']+)'/g;
    for (const [, name, version] of launcherSource.matchAll(block)) routes[name] = version;
    return routes;
}

/** The launcher route a `plugin.json` server entry actually invokes. */
function routeOf(spec) {
    const args = spec.args || [];
    const i = args.findIndex((a) => a.endsWith('runtime-launcher.mjs'));
    return i === -1 ? null : args[i + 1];
}

describe('MCP runtime pins', () => {
    // The original defect. Two files named a version for the same package and
    // nothing compared them, so they drifted and the server stopped starting.
    test('every launcher route guards the reviewed pin', () => {
        const routes = launcherRoutes();
        assert.ok(Object.keys(routes).length > 0, 'parsed no routes from the launcher');

        for (const [route, guarded] of Object.entries(routes)) {
            const reviewed = MCP_SERVERS[route];
            assert.ok(reviewed, `launcher route "${route}" has no entry in dependencies.cjs`);
            assert.equal(
                guarded,
                reviewed.version,
                `launcher guards ${route} at ${guarded} but the reviewed pin is ${reviewed.version}. ` +
                'A mismatch makes the launcher exit 4 and the server unstartable.',
            );
        }
    });

    test('every reviewed server has a launcher route', () => {
        const routes = launcherRoutes();
        for (const name of Object.keys(MCP_SERVERS)) {
            assert.ok(routes[name], `dependencies.cjs declares "${name}" but the launcher cannot start it`);
        }
    });

    test('the documented pins match the reviewed pins', () => {
        // setup-dependencies/SKILL.md tables the pins for the reader. A table
        // that disagrees with the code sends someone to install the wrong thing.
        const skill = read('skills', 'setup-dependencies', 'SKILL.md');
        for (const { package: pkg, version } of Object.values(MCP_SERVERS)) {
            assert.ok(
                skill.includes(`${pkg}@${version}`),
                `SKILL.md does not document ${pkg}@${version}`,
            );
        }
    });
});

describe('plugin.json', () => {
    test('every declared server invokes a real launcher route', () => {
        // The package registers its Playwright server as `alex-playwright` to
        // avoid colliding with a host's built-in, while the launcher route
        // stays `playwright`. That indirection is intentional and easy to break
        // by renaming one side only.
        const routes = launcherRoutes();
        for (const [name, spec] of Object.entries(pluginJson.mcpServers || {})) {
            const route = routeOf(spec);
            assert.ok(route, `server "${name}" does not invoke the runtime launcher`);
            assert.ok(routes[route], `server "${name}" invokes unknown launcher route "${route}"`);
        }
    });

    test('every declared server points at a launcher that exists', () => {
        for (const [name, spec] of Object.entries(pluginJson.mcpServers || {})) {
            const rel = (spec.args || []).find((a) => a.endsWith('runtime-launcher.mjs'));
            assert.ok(existsSync(join(ROOT, rel)), `server "${name}" references a missing launcher: ${rel}`);
        }
    });

    test('skills and commands directories resolve', () => {
        for (const key of ['skills', 'commands']) {
            const dir = pluginJson[key];
            assert.ok(dir, `plugin.json has no "${key}"`);
            assert.ok(existsSync(join(ROOT, dir)), `plugin.json "${key}" points at a missing directory: ${dir}`);
        }
    });
});

describe('manifest matches disk', () => {
    const onDisk = {
        skills: () => readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
            .filter((e) => e.isDirectory()).map((e) => e.name),
        prompts: () => readdirSync(join(ROOT, 'prompts')).filter((f) => f.endsWith('.prompt.md'))
            .map((f) => f.replace('.prompt.md', '')),
        instructions: () => readdirSync(join(ROOT, 'instructions')).filter((f) => f.endsWith('.instructions.md'))
            .map((f) => f.replace('.instructions.md', '')),
    };

    // Both directions. Listing something that does not exist ships a broken
    // reference; shipping something unlisted means the manifest understates the
    // package, and the counts quoted in the README come from here.
    for (const kind of ['skills', 'prompts', 'instructions']) {
        test(`every manifest ${kind} entry exists on disk`, () => {
            for (const entry of manifest.assets[kind]) {
                assert.ok(existsSync(join(ROOT, entry.path)), `manifest lists a missing file: ${entry.path}`);
            }
        });

        test(`every ${kind} file on disk is in the manifest`, () => {
            const listed = new Set(manifest.assets[kind].map((e) => e.name));
            for (const name of onDisk[kind]()) {
                assert.ok(listed.has(name), `"${name}" exists on disk but the manifest does not list it`);
            }
        });
    }
});

describe('frontmatter', () => {
    const frontmatter = (text) => {
        const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!m) return null;
        const out = {};
        for (const line of m[1].split(/\r?\n/)) {
            const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
            if (kv) out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
        }
        return out;
    };

    test('every skill declares a name matching its directory, and a description', () => {
        for (const entry of manifest.assets.skills) {
            const fm = frontmatter(read(entry.path));
            assert.ok(fm, `${entry.path} has no frontmatter`);
            assert.equal(fm.name, entry.name, `${entry.path} declares name "${fm.name}"`);
            assert.ok(fm.description?.length > 0, `${entry.path} has no description`);
        }
    });

    test('every instruction declares a description and applyTo', () => {
        // applyTo decides whether an always-on instruction loads at all. Missing
        // it is silent: the file ships and never fires.
        for (const entry of manifest.assets.instructions) {
            const fm = frontmatter(read(entry.path));
            assert.ok(fm, `${entry.path} has no frontmatter`);
            assert.ok(fm.description?.length > 0, `${entry.path} has no description`);
            assert.ok(fm.applyTo?.length > 0, `${entry.path} has no applyTo`);
        }
    });
});

describe('markdown links', () => {
    test('no relative link points at a missing file', () => {
        // Code fences carry illustrative paths and templates carry placeholders;
        // neither is a real link, and treating them as one produces noise that
        // trains people to ignore the check.
        const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
            if (e.name === '.git' || e.name === 'node_modules') return [];
            const full = join(dir, e.name);
            return e.isDirectory() ? walk(full) : (e.name.endsWith('.md') ? [full] : []);
        });

        const broken = [];
        for (const file of walk(ROOT)) {
            const text = readFileSync(file, 'utf8')
                .replace(/```[\s\S]*?```/g, '')
                .replace(/`[^`\n]*`/g, '');
            for (const [, target] of text.matchAll(/\]\(([^)]+)\)/g)) {
                const path = target.split('#')[0].trim();
                if (!path) continue;
                if (/^(https?:|mailto:|#|<)/.test(path)) continue;
                if (/[{}<>?*]|\$\{/.test(path)) continue;
                if (!existsSync(resolve(dirname(file), path))) {
                    broken.push(`${file.replace(ROOT, '.')} -> ${path}`);
                }
            }
        }
        assert.deepEqual(broken, [], `dead relative links:\n  ${broken.join('\n  ')}`);
    });
});

describe('documented counts', () => {
    // Counts in prose have no compiler behind them, so most of this package's
    // documentation avoids them: "every skill" and "All / None" say the same
    // thing and cannot go stale. Where a count genuinely informs a reader
    // deciding whether to install, it stays — and this test is the price of
    // keeping it.
    const truth = () => ({
        skills: manifest.assets.skills.length,
        instructions: manifest.assets.instructions.length,
        commands: manifest.assets.prompts.length,
        servers: Object.keys(pluginJson.mcpServers || {}).length,
    });

    const patterns = {
        skills: /(\d+)\s+skills/g,
        instructions: /(\d+)\s+always-on instructions/g,
        commands: /(\d+)\s+slash commands/g,
        servers: /(\d+)\s+MCP servers/g,
    };

    for (const doc of ['README.md', 'ROADMAP.md']) {
        test(`${doc} quotes the real counts`, () => {
            // Historical notes legitimately cite a number that was true at the
            // time ("retiring one command left 16 slash commands in four
            // places"). Those live in blockquotes, which are skipped.
            const text = read(doc)
                .split(/\r?\n/)
                .filter((line) => !line.trimStart().startsWith('>'))
                .join('\n');
            const actual = truth();

            for (const [kind, pattern] of Object.entries(patterns)) {
                for (const [phrase, found] of text.matchAll(pattern)) {
                    assert.equal(
                        Number(found),
                        actual[kind],
                        `${doc} says "${phrase.trim()}" but there are ${actual[kind]}`,
                    );
                }
            }
        });
    }
});

describe('Microsoft Scout setup guidance', () => {
    const readme = read('README.md');
    const roadmap = read('ROADMAP.md');
    const scoutSetup = readme.match(
        /### On Microsoft Scout, register the MCP servers([\s\S]*?)### Optional: extra tools/,
    )?.[1] || '';

    test('uses skills and bundled scripts instead of unavailable slash commands', () => {
        assert.ok(scoutSetup, 'could not find the Microsoft Scout setup section');
        assert.doesNotMatch(
            scoutSetup,
            /\/alex-act-one\s+/,
            'Scout has no plugin slash-command surface',
        );
        assert.match(scoutSetup, /setup-dependencies/);
        assert.match(scoutSetup, /register-scout-mcp\.mjs/);
    });

    test('package metadata and roadmap do not overstate automatic setup', () => {
        assert.doesNotMatch(pluginJson.description, /single-install/i);
        assert.doesNotMatch(roadmap, /GitHub Copilot app[^.\n]*untested/i);
        assert.match(roadmap, /plugin-root check/i);
    });

    test('makes duplicate plugin roots and restart requirements checkable', () => {
        assert.match(scoutSetup, /plugin root/i);
        assert.match(scoutSetup, /fully quit(?: and restart)? Scout/i);
    });

    test('names every Flint tool expected after Scout restarts', () => {
        for (const tool of [
            'compile_chart',
            'create_chart_view',
            'list_chart_types',
            'list_themes',
            'render_chart',
            'validate_chart',
        ]) {
            assert.match(scoutSetup, new RegExp(`\\b${tool}\\b`), `missing Flint tool ${tool}`);
        }
    });
});

describe('activation', () => {
    // The smoke suite previously checked structure without ever running the
    // activation path, and a defect hid in exactly that gap: bootstrap-core
    // hardcoded a count of 15 instructions, so adding a sixteenth — the thing
    // compile-brain and meditation exist to do — made activation throw while
    // every structural test stayed green. Running it is the only check that
    // would have caught that.
    const BOOTSTRAP = join(ROOT, 'skills', 'bootstrap-core', 'scripts', 'bootstrap-core.cjs');

    /** Preview only. Without --apply nothing is written to any profile. */
    const preview = () => JSON.parse(execFileSync(process.execPath, [BOOTSTRAP], {
        encoding: 'utf8',
        timeout: 60000,
    }));

    test('previews without error and writes nothing', () => {
        const plan = preview();
        assert.equal(plan.apply, false, 'a bare invocation must not apply');
        assert.equal(plan.mode, 'activate');
    });

    test('plans exactly the instructions the manifest declares', () => {
        // Ties activation to the manifest rather than to any fixed number, so
        // the suite keeps working as the package grows.
        const plan = preview();
        const declared = manifest.assets.instructions.length;
        assert.equal(plan.files.length, declared,
            'activation plans a different number of files than the manifest declares');
        assert.equal(plan.expectedFiles, declared,
            'the plan reports a different expected count than the manifest declares');
    });
});

describe('provisioned runtime', () => {
    // These need `setup-dependencies` to have run, so they skip rather than fail
    // where it has not — a clean checkout should not report a red suite for a
    // step it was never asked to perform.
    const runtimeRoot = process.env.ALEX_ACT_ONE_RUNTIME_ROOT
        || join(homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');
    const provisioned = existsSync(join(runtimeRoot, 'node_modules'));
    const skip = provisioned ? false : 'runtime not provisioned';

    for (const [route, spec] of Object.entries(MCP_SERVERS)) {
        test(`${route} starts and reports ${spec.version}`, { skip }, () => {
            // Exit 0 alone would pass while the launcher ran the wrong version.
            // Asserting the reported version closes that gap.
            const out = execFileSync(process.execPath, [join(ROOT, LAUNCHER_REL), route, '--version'], {
                encoding: 'utf8',
                timeout: 60000,
            });
            assert.match(out, new RegExp(spec.version.replace(/\./g, '\\.')),
                `${route} started but reported "${out.trim()}" instead of ${spec.version}`);
        });
    }

    test('an unknown route fails loudly', { skip }, () => {
        assert.throws(
            () => execFileSync(process.execPath, [join(ROOT, LAUNCHER_REL), 'no-such-route'], { encoding: 'utf8' }),
            /Unknown MCP runtime route/,
        );
    });
});
