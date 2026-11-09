# Lean runtime package

Packaging serves this repository's mission: maintain and ship Alex ACT ONE.
The candidate contains product capabilities, runtime support, and adoption
documentation, not adopter-project recovery records or fleet operations.

The [builder](../scripts/build-plugin-package.mjs) produces a reproducible
candidate under `dist/alex-act-one/`. Release preparation uses the same
allowlist to generate `package/alex-act-one/`, the source-subdirectory payload
selected since `0.9.4` and retained for `0.9.6`. The approved Mall route is
`v0.9.6:package/alex-act-one`; [the release record](../archive/verification/release-0.9.6/README.md)
verifies its publication separately from assembly and installation.

## Included

- All manifest-declared skills, instructions, and compatibility commands,
  plus their bundled resources and scripts.
- Shared runtime/authoring helpers required by those workflows.
- User guides, reusable verification definitions/contracts, and both exact
  Flint HTML demonstrations.
- The locked demonstration runtime inputs and the explicitly documented
  standalone Rich Email regression test.
- Plugin metadata, license, optional installer and installation-verification
  scripts, and a package-specific scope notice in the README/testing guide.

## Excluded

Maintainer history, recovery manifests/logs, old plans, source-only CI/catalog
tooling, and the maintainer recovery/archiving/package builders are excluded.
Links to unshipped maintainer documents are explicitly routed to the source
repository in generated package copies; source documentation is not modified
by packaging. This keeps required runtime-owner links local and preserves
reference context without pretending archival files were bundled.

## Build and verify

```powershell
node scripts\build-plugin-package.mjs --build
node scripts\build-plugin-package.mjs --check
node --test tests\plugin-package.test.mjs
```

For the selected release payload:

```powershell
node scripts\build-plugin-package.mjs --build --release --out package\alex-act-one
node scripts\build-plugin-package.mjs --check --out package\alex-act-one
```

The builder refuses an existing destination rather than silently replacing a
candidate. For another build, select a new repository-owned directory with
`--out <directory>` and use the same option for its check. It validates the
complete allowlist, rejects linked sources and path
escapes, checks local Markdown links, hashes every source/output file, and
detects source changes before publishing the directory. A failed build leaves
the existing source and installed plugin unchanged.

The exported verifier resolves relative package and source roots before
walking containment paths. Regression coverage bounds the former relative-path
hang; the CLI continues to require a repository-owned candidate destination.

The generated `package-receipt.json` records output hashes, source hashes,
declared link/scope edits, the source baseline commit, and normalized source
content hashes. Source matching permits only LF/CRLF checkout differences;
payload bytes remain exact. Uncommitted source changes
are represented by file hashes, not misrepresented as belonging to that commit.
The ignored build directory is reproducible local output, not remotely backed-up
delivery. Its receipt is also saved in the repository verification area.

Tests exercise exact demo preservation, manifest completeness, disposable
bootstrap preview/apply/idempotency, and missing-file detection. They do not
install into a real user profile or establish fresh behavior in every host.

## Distribution gate

The `0.9.3` Mall entry selected the repository root. The `0.9.4` delivery
selection uses `source.path: package/alex-act-one` at its immutable tag.
The [GitHub Copilot CLI reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
documents `owner/repo:path` subdirectory installation, but
that fact does not establish a tested marketplace source-subdirectory adapter.

Before publishing that transition, verify the precise Mall schema and a real
disposable install of that exact object-source/path, commit the generated
payload with frozen-byte attributes, and require the same candidate's full
release gates. Verify the local update and profile receipt separately after
Mall publication. Package status `release-payload` means assembled bytes,
not proof that a release was published or a host restarted.
