# Embedded-browser interaction UAT

Use for a local interactive artifact, hidden-page timeouts, sandboxed frames, or
input that reports success without changing the intended view. This is a
diagnostic reference, not a requirement to use CDP or install another browser.

## Diagnose before another retry

After an unexpected input failure, distinguish these hypotheses before changing
the artifact or repeating the same action:

1. **Not ready:** the expected frame, marks, or state has not mounted. Wait for
   an observable condition, not just page load or a host's "Live" label.
2. **Hidden or unfocused:** inspect `document.visibilityState`, focus, and
   frame geometry through the browser's page-evaluation API. A hidden tab can
   suspend `requestAnimationFrame`, stalling actionability checks, range
   filters, resize observers, and captures. Ask for the intended tab to be
   visible; do not treat a timeout as a chart defect.
3. **Wrong input target:** inspect the event target in the intended child frame.
   A click can reach the outer `IFRAME` while the chart receives no event.
   Input success at the parent is not evidence that a child control ran.
4. **Wrong acceptance probe:** marks can be restyled or replaced by a theme.
   Observe semantic identity, visible response, and state rather than a single
   mark shape, DOM ordering, or assumed widget type.

Use a bounded task-local event trace if necessary: target, event type,
coordinates, `isTrusted`, and before/after state. Remove listeners after the
check. Do not retain traces of unrelated or authenticated-page activity.
Force-clicking or dispatching a DOM event is not a trusted pointer test; report
DOM activation separately from the input path a reader would use.

## Target-scoped input when supported

If the native tool exposes and permits Playwright/CDP for the selected local
fixture, these mechanisms were exercised in VS Code:

- `page.context().newCDPSession(page)` can scope
  `Emulation.setFocusEmulationEnabled` to the test page. Keep the session alive
  while exercising frame-timed behavior; disable emulation in `finally` and
  detach the session. Do not overwrite `visibilityState` or bypass sharing,
  authentication, browser security, or user consent.
- For an out-of-process/sandboxed chart, resolve its actual frame and use
  `page.context().newCDPSession(child)` if supported. Send only the intended
  `Input.dispatchMouseEvent` or `Input.dispatchKeyEvent`; use child-frame
  coordinates from its own geometry, not parent-page offsets.
- A `role="application"` container need not be focusable. Find the actual
  tab stop and follow its announced keyboard instructions before asserting
  that Enter, arrows, or Escape are broken.
- Re-resolve the child after an iframe remount. A session attached to the old
  frame is not an input channel to its replacement.

Always detach child sessions and restore host emulation in `finally`, including
on assertion failure. Temporary diagnostic state is not a shipped-page fix.
These APIs are not guaranteed across hosts; confirm availability first.
If unsupported, report the exact missing capability and use an allowed fallback.
When the user explicitly requests the native browser, do not silently substitute
an external one or claim external-browser evidence as native UAT.

## Readiness, geometry, and artifacts

- Prefer condition-based waits. If a hidden page blocks animation-frame polling,
  bounded timer polling can inspect readiness, but cannot prove an unexecuted
  gesture or replace the frame work the artifact itself needs.
- After resizing, wait for the child viewport and chart layout to settle.
  Inspect each plot and its nearest clipping container with
  `getBoundingClientRect`; document-level overflow alone can miss clipped marks.
- A complete image can still be broken. Check `decode()` or `naturalWidth > 0`,
  including data-URI SVG and offscreen examples, not just resource requests.
- An offline claim needs a fresh load with network requests observed or blocked,
  not merely a warm tab whose dependencies might already be cached.
- A download click, generated Blob, or correct filename does not prove a saved
  file. Where supported, observe the download event, read and validate the
  artifact, and clean up only the test-owned file. Otherwise mark download
  completion **unverified** and name the host limitation.

Report the browser/host, input method, pages and cases exercised, verified state
changes, and remaining gaps. DOM-only checks, trusted input, image decode, and
successful file saving are different evidence levels.
