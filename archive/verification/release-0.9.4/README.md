# 0.9.4 release verification

Alex ACT ONE `0.9.4` is published from frozen commit
`ba657521416a51fbe84696b6676db3fb69a36778`.
The public Mall selects that release's `package/alex-act-one` payload.
Local installation and activation remain deferred, not verified successes.

## Current evidence

- [Published release](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.4)
  and [release notes](release-notes.md).
- [Structured verification and publication receipt](verification.json).
- [Full six-job same-commit matrix](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42498345981).
- [Both real Edge acceptance reports](browser.json).
- [Native installation observations and explicit publication exception](native-installation.json).
- [Published 0.9.3 root-route control](native-root-control.json).

Fresh-checkout gates passed 600 structural and 58 integration tests without
failures, skips, todos, or cancellations. Both exact demo rebuilds, payload
source/hash checks, and the no-write activation preview passed. The disposable
checkout and temporary test profiles were removed, not committed.

Mall source metadata was committed before catalog generation so catalog links
point to committed `0.9.4` metadata. Both commits were pushed together.
The curated pipeline passed 69 tests and validation. The public registry's
version, source tag, and payload path were verified after push. GitHub accepted
the Mall push with a repository-rule bypass notice; no repository rule was
changed by this task.

## Earlier candidates

[Initial route proof](marketplace-route-initial.json) and
[initial browser reports](browser-initial.json) belong to
`9f9d248f47956bab3d017b473734e7ac9f66a418`, not the final release.
They are retained unchanged and are not final-candidate installation proof.

Earlier full runs
[42495638729](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42495638729),
[42496350355](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42496350355),
[42497006087](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42497006087),
and [42497648739](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42497648739)
were blocked, not treated as release passes. Windows DOS aliases exposed
inconsistent filesystem/worktree identity. Native resolution and a shared
session matcher fixed detection/recovery; canonical disposable fixture roots
then restored the intended Git rollback fault injection.

The attached CLI continued to report installation success without an installed
entry or plugin skill discovery. A cache fetch and enabled setting did not
satisfy that gate. The maintainer explicitly approved publication and chose a
manual reinstall rather than an automated local upgrade.

These records cover this source release and Mall selection, not all hosts,
paid image APIs, accessibility, or a new runtime rollback design.
