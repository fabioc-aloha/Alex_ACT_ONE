import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const BASE = '32e94005825c248968f31e0bbe69be3a531dd435';
const HEAD = 'dd242ccefecbc8739937c9ddf4dfc56b40ff9627';
const HISTORY = 'docs/verification/session-recovery/';
const hash = data => createHash('sha256').update(data).digest('hex');
const portable = value => value.split(sep).join('/');
const read = file => readFileSync(join(ROOT, file), 'utf8');
const git = args => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
const tableText = text => String(text).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').trim();
const link = (file, label = file) => {
    const archived = file.replace(/^docs\/verification\/(session-recovery|development-recovery|recovery-retention-review)\//,
        'archive/verification/$1/').replace(/^docs\/plans\//, 'archive/plans/');
    const current = existsSync(join(ROOT, file)) ? file : archived;
    return `[${tableText(label)}](${existsSync(join(ROOT, current)) ? portable(relative(HERE, join(ROOT, current))) :
        `https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/${HEAD}/${file}`})`;
};
const snapshot = file => execFileSync('git', ['show', `${HEAD}:${file}`],
    { cwd: ROOT, maxBuffer: 10 * 1024 * 1024 });

// These selections are the maintainer-facing review, not an automated retention policy.
const archiveIds = new Set([
    6, 8, 10, 12, 14, 16, 18, 19, 21, 33, 35, 36, 39, 43, 45,
    52, 53, 59, 61, 62, 63, 64, 65, 69, 79, 80, 82, 92, 99, 102, 105, 108,
    123, 124, 126, 128, 130, 131, 133, 137, 138, 142, 144, 146, 147,
    156, 157, 158, 159, 161, 163, 165, 166, 171, 172,
    173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187,
    188, 189, 195, 196, 198, 199, 200, 201, 202, 203, 206, 207, 208, 209,
    211, 213, 214, 215, 216, 217, 218, 219, 220,
]);
const overrides = {
    12: 'Original live recovery failure: requests user-supplied denied content and invents staging state. Preserve beside corrected results.',
    21: 'Substantive native-feature replacement analysis with preservation requirements and citations; historical research, not active policy.',
    43: 'Real CLI invocation failure; preserves why the original runner invocation had to change.',
    45: 'Distinct failed stdin invocation; preserves the runner compatibility diagnosis.',
    52: 'Actual hosted Ubuntu Node 24 fixture-copy failure; local Windows passes did not establish release readiness.',
    53: 'Actual hosted Ubuntu Node 26 fixture-copy failure; a different matrix lane, not an exact duplicate.',
    59: 'Browser evidence of linked-selection failure, not merely a screenshot or a passing renderer.',
    61: 'Browser attempt with resize, keyboard, linked-selection/reset and saved-spec failures; retain as counterevidence.',
    62: 'Representative corrected browser pass; do not infer all-host certification from it.',
    63: 'Visually inspected desktop linked-board screenshot; useful visual history, not behavioral proof.',
    64: 'Actual resize/focus failures; preserves the failure that the subsequent browser work addresses.',
    65: 'Visually inspected narrow/mobile linked-board screenshot; distinct from desktop and synthetic fixture captures.',
    69: 'Hosted failure details for the portability/renderer work. Bulky but unique; archive or compress after preserving diagnostic excerpts.',
    79: 'Actual position-rounding diagnosis, distinct from the timezone diagnosis; useful reproduction history.',
    80: 'Actual timezone diagnosis, distinct from renderer position rounding; useful reproduction history.',
    82: 'Original golden-artifact failure; explains why passing integration tests did not prove byte-for-byte demo parity.',
    92: 'Complete successful locked-runtime hosted matrix. Keep one final receipt rather than every progress poll.',
    124: 'Corrected source-level denied-handoff response with guidance digests; retain beside the original failure.',
    126: 'Source retest invocation/version/permission context; preserve together with its observations.',
    128: 'Historical 0.9.0 release narrative and limitations; not the current installation guide.',
    130: 'Passing exclusive browser-run receipt; canonical retained copy for an exact-duplicate pair.',
    131: 'Release-labelled receipt still contains a resize failure. Preserve as failed evidence, not a successful release gate.',
    138: 'Full isolated-install receipt includes payload-file verification; preferable to the shorter provisional receipt.',
    144: 'Delivered-package denied-handoff behavior; source retest and installed-package retest are different evidence.',
    146: 'Delivered-package retest invocation/version/permission context; retain with the response.',
    156: 'Retired-instruction legacy ownership regression failure; keep the counterexample, not every intermediate green run.',
    157: 'Foreign receipt-entry ownership rejection failure; independent safety invariant.',
    158: 'Original activation conflict failures; important fail-closed preservation evidence.',
    159: 'Retired-instruction ownership preservation failure; complements the legacy-format case.',
    171: 'Actual fixture converter/helper results supporting the installed skill report; not full semantic coverage.',
    172: 'Activated-instruction chart retest receipt; no-write/fixture context is distinct from the standalone chart run.',
    174: 'Visually inspected synthetic chart fixture capture; supports the specific rendered-output check.',
    176: 'Live chart-framing defect trace; keep because a structural catalog scan did not establish valid chart identifiers.',
    177: 'Activated chart retest trace; distinguishes numeric-evidence recovery from the remaining identifier defect.',
    178: 'Permission-blocked compiler trace; preserve the limitation rather than count it as certified execution.',
    181: 'Limited live review trace; preserve the reported scope and blocked-tool boundary.',
    185: 'Plan-only scenario trace; useful evidence of the planning/implementation boundary.',
    186: 'Live recovery scenario trace with limits; not a replacement for current repository continuity.',
    189: 'Detailed installed skill results, execution coverage and limitations; substantively richer than zero-finding static inventories.',
    199: 'Real converter/network-path and output safety regression failures; keep the counterexamples.',
    202: 'Installer preservation failures; independent evidence for no automatic replacement of unrelated installed state.',
    203: 'Corrected real-browser receipt; canonical retained copy, with duplicate repeat files eligible for deletion.',
    206: 'Visibility diagnosis reproduces resize stalls that resolve after scrolling. Unique root-cause evidence.',
    207: 'Fresh-clone source/integration/artifact verification tied to the converter fixes; not reproducible by reading the report alone.',
    208: 'Final converter-fix integration and exact-artifact receipt; companion evidence to the readiness review.',
    209: 'Final structural receipt cited by the readiness review; preserve alongside its resolution statement.',
    211: 'Original readiness findings plus documented resolution and evidence links; substantive engineering history.',
    213: 'Original production-review browser failure; retain beside the corrected receipt and visibility diagnosis.',
    214: 'Original integration pass despite later reproduced defects; helps explain a prior test-coverage blind spot.',
    215: 'Original structural pass despite later reproduced defects; distinct from the corrected structural receipt.',
    216: 'Frozen helper pins old source commit ac9e637 and version 0.9.1. Preserve as historical reproducibility code, not a current command.',
    217: 'Separate production-labelled browser receipt; historical observation, not proof of current app-host behavior.',
    218: '0.9.2 installed-package integration evidence; source structural checks are not an equivalent substitute.',
    219: 'Incorrect installed-cache structural invocation failed because Git metadata was absent; retain the failure and corrected invocation.',
    220: 'Correct source-checkout structural invocation; pair with the failed installed-cache run.',
};

const createdDecisions = {
    'ARTIFACT-PERSISTENCE-FOR-ALEX-ACT-ONE.md': ['ARCHIVE', 'Useful implementation proposal, but not executable enforcement. Move to the normal plan/design location, retain its acceptance criteria, and reconcile stale rollout status.'],
    'docs/verification/development-recovery/2026-11-08/README.md': ['ARCHIVE', 'Human navigation and limits for the cross-repository recovery. Belongs to maintainer operations history, not every adopter runtime.'],
    'docs/verification/development-recovery/2026-11-08/results.json': ['ARCHIVE', 'Per-repository copy/exclusion custody counts; keep with the cross-repository recovery report, not as a plugin capability.'],
    'docs/verification/development-recovery/2026-11-08/sync-results.json': ['ARCHIVE', 'Exact source synchronization snapshot and policy-PR results. Historical maintainer record; not current fleet state or a standing telemetry ledger.'],
    'docs/verification/session-recovery/README.md': ['KEEP', 'The archive needs an index, historical-status explanation, exclusions, and verification instructions. Update links/counts in any approved pruning.'],
    'docs/verification/session-recovery/manifest.json': ['KEEP', 'Original/recovered hashes and declared edits are the custody record. Do not delete or silently mutate it independently of retained evidence.'],
    'scripts/recover-local-artifacts.mjs': ['ARCHIVE', 'Useful recovery helper, but task-specific multi-repository tooling with hard-coded exclusions. Keep in maintainer tools/history or transfer custody to Steward; do not make it an ordinary runtime obligation.'],
    'scripts/session-recovery.mjs': ['KEEP/REPAIR', 'Keep archive verification; separate it from the hard-coded historical session import. Both recovery helpers currently depend on sanitizeText from this file.'],
    'skills/git-workflow/scripts/check-git-auth.cjs': ['KEEP/REPAIR', 'Addresses a real portable authentication need, but currently infers account identity from repository owner, accepts arbitrary HTTPS hosts, and verifies helper text rather than working authentication.'],
    'skills/proactive-awareness/references/project-artifact-storage.md': ['KEEP', 'Canonical shared delivery/authority/privacy contract. This is the prevention mechanism to retain, distinct from recovery history.'],
    'skills/proactive-awareness/scripts/check-session-artifacts.cjs': ['KEEP/REPAIR', 'Useful bounded detector, but stale manifest records suppress missing/changed artifacts; hard-coded manifest location misses other project archives; unsupported/ignored/link cases are not coverage proofs.'],
    'tests/artifact-storage.test.mjs': ['KEEP/REPAIR', 'Protects shared guidance and basic detector behavior. Add failing coverage for stale manifests, ignored copies, alternate archives and worktrees; text matching alone does not prove prevention.'],
    'tests/git-auth.test.mjs': ['KEEP/REPAIR', 'Protects multi-account parsing/config behavior. The mock only validates config strings, not actual credential-helper execution; add failure/auth identity and safe mutation tests.'],
    'tests/local-artifact-recovery.test.mjs': ['ARCHIVE', 'Keep with the maintainer recovery helper if moved. Its boundary/privacy/deduplication tests are useful, but not a runtime feature by themselves.'],
    'tests/session-recovery.test.mjs': ['KEEP/REPAIR', 'Archive integrity and negative controls are valuable. Split the historical importer tests if its hard-coded import mode is archived; adapt frozen-file inventory after authorized pruning.'],
};

const existingDecisions = {
    '.gitattributes': ['KEEP', 'Keep scoped frozen-byte preservation. Narrow/remove archive rules only when the owning historical paths change; do not weaken ordinary source whitespace checks.'],
    '.gitignore': ['KEEP', 'Keep the narrow historical-log exception while those logs are retained. Do not replace it with broad exemptions for runtime scratch.'],
    'AGENTS.md': ['KEEP', 'Portable repository storage guidance is appropriate; do not delete existing continuity and ownership guidance as part of recovery cleanup.'],
    'CHANGELOG.md': ['KEEP', 'Completed source/recovery history belongs here. Preserve concise entries and links; it is not permission to erase past releases.'],
    'HANDOFF.md': ['KEEP', 'Restart-critical state remains necessary. Remove stale work-in-progress claims only by reconciling current evidence, not by deleting the handoff.'],
    'README.md': ['KEEP', 'Keep product inventory and the concise storage boundary; move bulky recovery details into their index rather than remove the README.'],
    'ROADMAP.md': ['KEEP', 'Owns pending host/enforcement work; instructions and a historical recovery test do not close the runtime enforcement gate.'],
    'docs/flint-experimental.html': ['KEEP', 'Pre-existing product demonstration, not newly recovered clutter. Only release provenance changed during this work.'],
    'docs/flint-showcase.html': ['KEEP', 'Pre-existing product demonstration, not newly recovered clutter. Its large size is unrelated to recovery retention.'],
    'docs/getting-started.md': ['KEEP', 'Existing onboarding guide; only release notices were updated.'],
    'docs/install.md': ['KEEP', 'Existing host/install reference; preserve source/Mall/activation boundaries.'],
    'docs/testing.md': ['KEEP', 'Owns dated verification claims and release limits. Retain concise recovery receipts, not every raw intermediate log inline.'],
    'instructions/session-health-monitoring.instructions.md': ['KEEP', 'Manifest-declared resident storage/delivery floor. Preserve the no-write/authority boundaries; this is not filesystem enforcement.'],
    'manifest.json': ['KEEP', 'Required plugin asset/role inventory; new helper files do not justify deleting the manifest.'],
    'plugin.json': ['KEEP', 'Required product metadata/MCP routing; version bump is a release change, not recovery clutter.'],
    'skills/bootstrap-core/SKILL.md': ['KEEP', 'Preserve activation and installed-source guidance for the updated storage instruction.'],
    'skills/bootstrap-project/SKILL.md': ['KEEP', 'Portable adoption route is useful; auth preview must not be mistaken for a verified automatic repair.'],
    'skills/bootstrap-project/resources/AGENTS.md': ['KEEP', 'New repositories need the portable storage rule; existing project-owned guidance remains preserved.'],
    'skills/git-workflow/SKILL.md': ['KEEP/REPAIR', 'Keep storage/auth routing, but qualify the claim that every Copilot shell injects credential.interactive=never; that was observed in this environment, not proved universally.'],
    'skills/git-workflow/references/execution-details.md': ['KEEP/REPAIR', 'Useful detailed auth guidance, but repository owner is not always the authenticating user and platform/account behavior should remain version-scoped.'],
    'skills/meditation/SKILL.md': ['KEEP', 'Bounded authorized preservation/indexing belongs here; session end still grants no broader writes.'],
    'skills/plan/SKILL.md': ['KEEP', 'Important root-cause correction: private reasoning is not the sole home of a requested plan deliverable.'],
    'skills/proactive-awareness/SKILL.md': ['KEEP/REPAIR', 'Keep read-only delivery-check routing; detector output needs stronger verification and honest unsupported/missing scope reporting.'],
    'skills/proactive-awareness/references/project-recovery.md': ['KEEP/REPAIR', 'Read-only recovery route is useful. Scanner limitations and approved exceptions must be explicit before treating absence as clean.'],
    'skills/proactive-awareness/references/runtime-session-health-monitoring.md': ['KEEP', 'Keep the shared storage route and distinct session/repository authority boundaries.'],
    'skills/project-status/SKILL.md': ['KEEP/REPAIR', 'Status should surface delivery/auth blockers, but unconditional whole-session scans can be expensive and irrelevant. Use bounded explicit scope and report unsupported cases.'],
    'skills/render-verify/SKILL.md': ['KEEP', 'Verification must inspect final repository artifacts rather than only a temporary preview.'],
};

function observedHistory(file, data) {
    if (!data.length) return 'Empty file: 0 bytes.';
    if (file.endsWith('.png')) return 'Image inspected visually: historical synthetic chart or linked-board capture.';
    const text = data.toString('utf8');
    if (file.endsWith('.json')) {
        const value = JSON.parse(text);
        if (value.reports) {
            return value.reports.map((report, i) => {
                const failures = (report.checks || []).filter(check => check.status === 'failed');
                return `page ${i + 1}: ${report.passed ? 'pass' : 'FAIL'}${failures.length ? ` (${failures.map(check => check.id).join(', ')})` : ''}`;
            }).join('; ');
        }
        if (value.findings) return `${value.findings.length} findings; target inventory ${value.target?.fileCount ?? 'unspecified'}; static ${value.schemaVersion ?? ''} schema.`;
        if (value.response) return `Historical model response with ${value.toolCalls?.length ?? 0} recorded tool calls; semanticStatus=${value.semanticStatus}.`;
        if (value.results) return `Historical result inventory (${value.results.length} entries); version=${value.pluginVersion || value.version || 'recorded per result'}.`;
        return `JSON keys: ${Object.keys(value).join(', ')}.`;
    }
    if (file.endsWith('.jsonl')) {
        const records = text.trim().split(/\r?\n/).map(line => JSON.parse(line));
        return `${records.length} diagnostic runs; ${records.filter(item => item.passed === false).length} failed; post-scroll fit observation retained.`;
    }
    if (file.endsWith('.md')) return `Historical authored report: ${text.match(/^# (.+)$/m)?.[1] || 'untitled'}.`;
    if (file.endsWith('.cjs')) return 'Historical code inspected; pins source ac9e637 and version 0.9.1; can apply to an explicit temporary instruction target.';
    const totals = [...text.matchAll(/^(?:#|ℹ) (tests|pass|fail|skipped|cancelled|todo) (\d+)/gm)];
    if (totals.length) {
        const value = {};
        for (const [, name, count] of totals) value[name] = count;
        return `Last test block: ${value.pass || '?'} passed / ${value.tests || '?'} total; ${value.fail || '0'} failed; ${value.skipped || '0'} skipped.`;
    }
    if (file.includes('watch')) {
        const run = text.match(/Verify source candidate [^\d]*(\d+)/)?.[1];
        return `CI progress polling; run ${run || 'ID in file'}; not the actual test/artifact output.`;
    }
    if (/UNKNOWN STEP/.test(text)) return 'Hosted CI task output inspected; matrix diagnostic or final receipt, not local test output.';
    if (file.includes('skill-test-evidence/')) return 'Live model scenario trace inspected; records response, tool activity, permissions and completion limits.';
    return text.split(/\r?\n/).filter(line => line.trim()).slice(-2).join(' ').slice(0, 220);
}

function historyDecision(id, file, data, duplicates) {
    if (!data.length) return ['DELETE', 'No content. Preserve the failed-attempt or empty-output fact in the manifest/review, not an empty physical file.'];
    const group = duplicates.get(hash(data));
    if (group.length > 1) {
        const canonical = group.find(entry => archiveIds.has(entry.id)) || group[0];
        if (canonical.id !== id) return ['DELETE', `Byte-identical duplicate of H${String(canonical.id).padStart(3, '0')} (${canonical.file}). Keep one copy and record the duplicate run identity; this is not independent raw evidence.`];
    }
    if (file.includes('watch') && file.endsWith('.log')) {
        return ['DELETE', 'Repeated CI progress polling, not test output. The run ID is retained in this review; detailed failure/final receipts and authored release history carry the useful evidence.'];
    }
    if (archiveIds.has(id)) {
        return ['ARCHIVE', overrides[id] || (
            file.endsWith('.log') ? 'Representative historical failure/correction or scoped live scenario evidence. Retain as maintainer history, not a runtime dependency.' :
                'Distinct historical evidence supporting a retained review or correction. Preserve with its source/version and limitations.'
        )];
    }
    if (file.endsWith('.json') && JSON.parse(data.toString('utf8')).findings) {
        return ['PRUNE', 'Large zero-finding generated structural inventory. The analyzer and versioned source can reproduce the structure; retain a concise fingerprint/count receipt if the historical result matters. Not an exact duplicate claim.'];
    }
    if (file.endsWith('.log') || file.endsWith('.txt')) {
        return ['PRUNE', 'Intermediate/repeated test or publication output. Later retained source/installed/clean-clone evidence and current executable regressions provide stronger coverage. Preserve any uniquely cited fact before deletion.'];
    }
    if (file.endsWith('.json')) {
        return ['PRUNE', 'Provisional or repeated receipt. Retain the representative final/failure receipt and version context; this is not an exact duplicate claim.'];
    }
    return ['PRUNE', 'Task-local historical material whose useful context is represented in retained reports. Confirm no unique unresolved requirement before deletion.'];
}

function rowsForReview() {
    const manifest = JSON.parse(snapshot(`${HISTORY}manifest.json`).toString('utf8'));
    assert.equal(manifest.artifacts.length, 220, 'Unexpected historical inventory');
    const input = manifest.artifacts.map((artifact, index) => {
        const file = `${HISTORY}${artifact.path}`;
        const data = snapshot(file);
        assert.equal(hash(data), artifact.sha256, `Frozen content changed: ${file}`);
        return { id: index + 1, file, data };
    });
    const duplicates = new Map();
    for (const item of input) {
        const digest = hash(item.data);
        if (!duplicates.has(digest)) duplicates.set(digest, []);
        duplicates.get(digest).push(item);
    }
    const rows = input.map(({ id, file, data }) => {
        const [recommendation, why] = historyDecision(id, file, data, duplicates);
        return { id: `H${String(id).padStart(3, '0')}`, file, origin: 'Recovered history',
            recommendation, bytes: data.length, sha256: hash(data),
            evidence: observedHistory(file, data), why,
            removalCondition: 'Requires approval; reconcile frozen manifest, indexes, historical citations and integrity tests. Archive is not deletion.' };
    });
    const changed = git(['diff', '--name-status', `${BASE}..${HEAD}`]).trim().split('\n').map(line => line.split('\t'));
    let added = 0, modified = 0;
    for (const [status, file] of changed) {
        if (file.startsWith(`${HISTORY}history/`)) continue;
        const inventory = status === 'A' ? createdDecisions : existingDecisions;
        assert.ok(Object.hasOwn(inventory, file), `Unreviewed file: ${file}`);
        const [recommendation, why] = inventory[file];
        const data = snapshot(file);
        rows.push({ id: `${status === 'A' ? 'N' : 'M'}${String(status === 'A' ? ++added : ++modified).padStart(3, '0')}`,
            file, origin: status === 'A' ? 'Created during recovery' : 'Existing file modified',
            recommendation, bytes: data.length, sha256: hash(data),
            evidence: status === 'A' ? 'Current content and consumers reviewed; creation confirmed against the 0.9.2 source baseline.' :
                'Existing project file; recovery changed its guidance, release metadata, or provenance, not its ownership.',
            why, removalCondition: recommendation === 'KEEP' || recommendation === 'KEEP/REPAIR' ?
                'Do not delete. Repair/consolidation needs scoped implementation and tests.' :
                'Relocate only after updating consumers and preserving history; no deletion approved.' });
    }
    assert.equal(added, 15, 'Unexpected created-file scope');
    assert.equal(modified, 27, 'Unexpected modified-file scope');
    assert.equal(rows.length, 262);
    assert.equal(new Set(rows.map(row => row.file)).size, rows.length);
    assert.ok(rows.find(row => row.id === 'H012').why.includes('denied content'));
    assert.equal(rows.find(row => row.id === 'H204').recommendation, 'DELETE');
    assert.equal(rows.find(row => row.id === 'H219').recommendation, 'ARCHIVE');
    return rows;
}

function render(rows) {
    const groups = ['KEEP', 'KEEP/REPAIR', 'ARCHIVE', 'PRUNE', 'DELETE'];
    const metrics = groups.map(name => ({ name, files: rows.filter(row => row.recommendation === name).length,
        bytes: rows.filter(row => row.recommendation === name).reduce((n, row) => n + row.bytes, 0) }));
    const escape = value => `"${String(value).replace(/"/g, '""')}"`;
    const columns = ['id', 'file', 'origin', 'recommendation', 'bytes', 'sha256', 'evidence', 'why', 'removalCondition'];
    const csv = `${columns.join(',')}\n${rows.map(row => columns.map(key => escape(row[key])).join(',')).join('\n')}\n`;
    assert.equal(csv.trim().split('\n').length, rows.length + 1, 'CSV row count differs');
    const summary = `# Recovery retention review\n\nDate: 2026-11-08. Audience: Alex ACT ONE maintainer.\n\n` +
        `Status: Historical approval inventory. The original review made recommendations only; ` +
        `the user subsequently approved the full lean cleanup and checker repairs. See [implementation.json](implementation.json) for actual removals. ` +
        `Rows and hashes below remain tied to the original reviewed commit; removed-file links use that Git snapshot.\n\n` +
        `## Recommendation\n\nKeep the prevention contract and appropriate live checks. Preserve a **curated engineering history**, not every scratch output. ` +
        `The competing option is retaining all historical bytes for forensic completeness; that is defensible, but should not make them runtime requirements. ` +
        `Revise any deletion recommendation if a file carries a unique unresolved finding, an irreplaceable reproduction, or a required citation not retained elsewhere.\n\n` +
        `Scope is ${rows.length} files at source \`${HEAD.slice(0, 7)}\`: 220 recovered files, 15 created files, and 27 existing files changed since the \`0.9.2\` source baseline. ` +
        `Existing release files are included to distinguish edits from new clutter. This review's own report outputs are outside that frozen input scope.\n\n` +
        `## Decisions\n\n| Recommendation | Files | Current bytes | Meaning |\n| --- | ---: | ---: | --- |\n` +
        metrics.map(item => `| ${item.name} | ${item.files} | ${item.bytes} | ${{
            KEEP: 'Belongs in the project; retain.',
            'KEEP/REPAIR': 'Belongs, but correctness/coverage needs repair.',
            ARCHIVE: 'Keep historical or maintainer custody; not ordinary runtime content.',
            PRUNE: 'Deletion candidate after extracting unique facts and reconciling citations.',
            DELETE: 'Strong candidate: empty, byte-identical redundant copy, or CI progress poll.',
        }[item.name]} |`).join('\n') +
        `\n\nBytes are current working-file lengths, not expected Git-history/disk savings. Several existing demo files are large but not recovery clutter. ` +
        `Deleting files from a new commit does not reclaim old Git objects or rewrite the published release.\n\n` +
        `## Important findings before cleanup\n\n` +
        `1. **The detector can report clean for missing or changed evidence.** Synthetic counter-tests of ${link('skills/proactive-awareness/scripts/check-session-artifacts.cjs')} returned \`clean\` when the manifest named a missing repository copy and when the original session file changed after recovery. ` +
        `It trusts manifest session/path/hash records without checking destination bytes. Its malformed-manifest catch also hides the manifest error. Retain and repair; do not treat its current output as a custody proof.\n` +
        `2. **Authentication verification is too weak.** ${link('skills/git-workflow/scripts/check-git-auth.cjs')} treats helper text and an account-name match as readiness; it does not exercise the configured helper or verify authenticated identity/access. ` +
        `It also conflates repository owner with login identity (organizations/collaborators), processes arbitrary HTTPS hosts as GitHub, and writes the helper in multiple steps without rollback. These are source-inspection findings, not a vulnerability assessment or live destructive tests.\n` +
        `3. **The local recovery helper is maintainer tooling.** ${link('scripts/recover-local-artifacts.mjs')} has task-specific rawfeed/snapshot exclusions and regex-based screening; it requires reviewed overrides for legitimate synthetic fixtures. ` +
        `Do not promote its exclusions into a universal classifier. Keep its tested custody value with operations history, or consolidate reviewed common mechanics without losing tests.\n` +
        `4. **The old importer and verifier are coupled.** ${link('scripts/session-recovery.mjs')} contains hard-coded historical session IDs as well as the useful archive verifier and shared \`sanitizeText\`. ` +
        `The other recovery helper and both test suites import it. Preserve/extract the verifier and shared sanitization before considering importer removal.\n` +
        `5. **Historical evidence is actually shipped.** Read-only filesystem inspection of the loaded \`0.9.3\` cache found both the recovery history and manifest. ` +
        `Moving files to an \`archive/\` folder does not, by itself, stop a source-based plugin install from fetching them. A lean release requires a separately verified packaging/custody design, not merely a folder rename.\n` +
        `6. **An empty-file count and exact duplicate hash are stronger than filename similarity.** Exact duplicates are marked below with a retained canonical row. ` +
        `Different assessments with zero findings are PRUNE candidates, not falsely labelled byte-identical. Failed browser receipts remain failures, even when their filenames say final or release.\n\n` +
        `## What was actually inspected\n\nEvery historical file was read and hashed. Logs were inspected through their test summaries, failing cases, diagnostic/error text and output context; JSON through schemas, results, findings, response/permission records and browser checks. ` +
        `Authored reports and helper implementations were read; the three PNGs were viewed. Existing live guidance and consumers/tests were checked. ` +
        `This is a retention review, not a fresh rerun of historical tests, proof of old numerical prose, web fact-check, or complete security audit. Old helpers were not executed.\n\n` +
        `The frozen archive integrity command passed for all 220 files and 9,318,096 recovered bytes. Synthetic detector counter-tests used disposable fixtures and did not change project input files. ` +
        `Read the [sortable file-by-file CSV](files.csv) for hashes, observed evidence, rationale and removal dependencies.\n\n` +
        `The [report renderer](render-review.mjs) preserves the explicitly reviewed selections and checks exact input scope, file hashes, counts and row coverage. ` +
        `Its rendering is deterministic; the recommendations remain human-review proposals, not an automatic deletion classifier. It only writes these report outputs.\n\n` +
        `## Cleanup order if approved\n\n` +
        `1. Preserve the source/tag recovery point and inventory. Do not rewrite Git history or remove external originals as part of pruning.\n` +
        `2. First remove only approved DELETE rows, retaining duplicate mappings, empty-attempt facts and CI run IDs in the custody record.\n` +
        `3. Decide which PRUNE rows contain any uniquely cited fact. Keep a concise receipt/excerpt where needed; archive the selected reports, failure-to-fix evidence, live traces and final receipts.\n` +
        `4. Update the manifest, retained indexes/links, historical-status notes and inventory tests coherently. The current strict verifier intentionally fails if any listed file is simply removed.\n` +
        `5. Repair the live detector/auth checker in a separate scoped change, then prove missing/changed/ignored/unsupported cases fail explicitly. Do not delete the safeguards because their first implementation is incomplete.\n` +
        `6. Only if requested, verify a new source/Mall release and installed package. No release or installed-cache change is authorized by this review.\n\n` +
        `## File-by-file recommendations\n\nRows H001-H220 retain the archive manifest order; N rows are newly created files; M rows are existing project files modified during the work.\n\n`;
    let markdown = summary;
    for (const [title, selected] of [
        ['Recovered history: main engineering session', rows.filter(row => row.origin === 'Recovered history' && row.file.includes('/11372d9c-'))],
        ['Recovered history: production review session', rows.filter(row => row.origin === 'Recovered history' && row.file.includes('/3e832a77-'))],
        ['Recovered history: separate browser and installation observations', rows.filter(row => row.origin === 'Recovered history' && !row.file.includes('/11372d9c-') && !row.file.includes('/3e832a77-'))],
        ['Files created during recovery', rows.filter(row => row.origin === 'Created during recovery')],
        ['Existing files changed, not newly recovered', rows.filter(row => row.origin === 'Existing file modified')],
    ]) {
        markdown += `### ${title}\n\n| ID | File | Recommendation | Why |\n| --- | --- | --- | --- |\n` +
            selected.map(row => `| ${row.id} | ${link(row.file, row.origin === 'Recovered history' ?
                row.file.split('/').slice(5).join('/') : row.file)} | ${row.recommendation} | ${tableText(row.why)} |`).join('\n') + '\n\n';
    }
    assert.equal((markdown.match(/^\| [HNM]\d{3} \|/gm) || []).length, rows.length, 'Markdown row count differs');
    return { markdown: `${markdown.trimEnd()}\n`, csv, metrics };
}

const rows = rowsForReview();
const result = render(rows);
const mode = process.argv[2];
assert.ok(mode === '--write' || mode === '--check', 'Use --write or --check');
for (const [file, contents] of [['README.md', result.markdown], ['files.csv', result.csv]]) {
    if (mode === '--check') assert.equal(readFileSync(join(HERE, file), 'utf8'), contents, `Review output differs: ${file}`);
    else writeFileSync(join(HERE, file), contents);
}
console.log(JSON.stringify({ inputFiles: rows.length, recommendations: result.metrics,
    recoveredFiles: 220, createdFiles: 15, modifiedExistingFiles: 27,
    inputScope: HEAD, outputs: ['README.md', 'files.csv'], mode }, null, 2));
