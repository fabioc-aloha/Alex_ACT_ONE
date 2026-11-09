# Install and host reference

For your first session, use [the short getting-started guide](getting-started.md).
This page keeps the host differences, alternate installation paths, optional
tools, and historical verification notes in one reference.

## Installation sources

| Source | What it delivers | What remains separate |
| --- | --- | --- |
| Mall | Recommended: the reviewed release selected by the marketplace entry | Source changes need a separately published release before they appear through this path |
| Repository | Deprecated direct-install path: repository source selected at installation time; it can include unreleased work | Temporary candidate testing only; review root/revision and do not assume future CLI support |
| Optional runtime | The separately provisioned chart, browser, image, and converter packages | Plugin installation does not activate instructions or provision these packages; installs and upgrades require their own approval |

Release version: `0.9.6`. Mall delivery uses the reviewed release tag and its
`package/alex-act-one` payload. Confirm publication in
[the release record](../archive/verification/release-0.9.6/README.md) before
upgrading; the user performs installation separately. A version is not evidence of live-host
activation. Packages with the same version can also contain different bytes.
Check the loaded plugin root, installation source, and revision when available;
if the revision cannot be established, do not claim exact source parity.
Use [the roadmap](../ROADMAP.md) to distinguish completed source work from the
published baseline. Never mix a checkout's bootstrap with a different installed
package merely because the versions match.

The [lean runtime package](package.md) uses an explicit allowlist, excluding the
maintainer archive while retaining both demonstrations and all declared runtime
owners. Version `0.9.3` used root delivery; the `0.9.4` source-path transition
requires exact-route disposable installation and same-commit release checks
before publication. Do not treat a generated directory as an upgrade.

## Testing the repository candidate

This section preserves the historical `0.9.0-rc.1` candidate-testing procedure.
It is not the normal installation path for the reviewed Mall release or the
current candidate.

**Deprecated installation path.** During the user's candidate install on
2026-11-05, installation succeeded and the CLI printed:

```text
Warning: Direct plugin installs (repos, URLs, local paths) are deprecated. Only plugin@marketplace installs will be supported in a future release.
```

Command availability in help does not establish that a path is not deprecated.
The warning names no removal date or version. Keep Mall as the normal install
path and plan marketplace-based candidate delivery; do not treat direct installs
as a durable workaround. This warning alone does not invalidate the already
installed candidate or require uninstalling it.

These are manual steps for the person switching installations, not commands
the preparation workflow runs automatically. Wait for the selected candidate's
same-commit verification to pass, then close apps that may lock or cache the
plugin. Use a separate terminal for the switch:

```powershell
copilot plugin uninstall alex-act-one@alex-mall
copilot plugin install fabioc-aloha/Alex_ACT_ONE
copilot plugin list --json
```

Confirm the enabled direct-repository entry reports the selected candidate's
version and expected repository source. Do not expect the historical
`0.9.0-rc.1` from a newer repository checkout. If an old or duplicate entry remains, stop rather than testing
an ambiguous payload. The direct command selects source available at installation
time; record its source revision when exposed and compare it with the verified
candidate commit. Do not assume version equality proves byte parity.

Uninstalling the plugin does not remove previously activated profile instructions
or the optional runtime. Do not delete either by glob. The runtime package pins
are unchanged for this candidate; no dependency upgrade is part of this switch.

Fully restart the host. Invoke the newly installed `bootstrap-core` skill and
confirm its loaded root and version before using its preview. Review the target,
file actions, and receipt; apply only after explicit approval. The candidate's
conflict guard must stop on modified or unowned instructions rather than
silently replace them. Follow the [first-session verification](getting-started.md#3-verify)
and then the [scenario run guide](verification/README.md).

Do not run `install-and-check.ps1` for this repository-candidate switch: that
helper uses Mall and applies instructions; it does not switch installation sources. No new release, Mall
publication, profile activation, or runtime installation is implied here.

## Where Alex ACT ONE Works

Skills sit at the package root, so each app can load them directly. Scout can
use the plugin installed for Copilot CLI under `~/.copilot`; a Scout-local ONE
copy is duplicate state and can drift independently. Verify the loaded root and
version before activation or Scout MCP registration. The other three surfaces
are not automatic in the same way, and this table says which are.

Native-first installed-package checks and a live CLI project-checkpoint probe
passed for `v0.7.0`; the Flint 1.0.1 integration was subsequently published in
`v0.8.0`. Neither source-level tests nor the offline demos establish fresh
activation parity across all hosts. The table describes supported delivery;
the dated observations below remain historical evidence.

| Where you use Copilot | Skills | Instructions | Slash commands | MCP servers |
| --- | --- | --- | --- | --- |
| Copilot CLI | All | All, after activation | All | All, from the manifest |
| VS Code with GitHub Copilot Chat | All | All, after activation | All | All, from the manifest |
| Microsoft Scout | All, after enabling **Load Copilot CLI skills** | All, after activation | **None** | All, after registration |
| GitHub Copilot app | All, discovered and invoked | All, active after activation | All, exposed | Registered; Flint and Playwright verified in the `v0.2.0` baseline |

The GitHub Copilot app test on 2026-09-13 found all 15 instructions active and
at hash parity with the installed `v0.2.0` sources. The app discovered the skill
catalog and prompt aliases; `bootstrap-core`, `platform-awareness`,
`proactive-awareness`, and `humanizer` were invoked. Playwright listed the
active browser tabs, and Flint validated a Vega-Lite chart with no warnings or
errors. Individual skills and
slash commands were not exhaustively invoked. This is historical host evidence,
not a `v0.3.5` activation claim.

The Scout row was re-checked against `v0.2.0` on 2026-09-13 inside a live session:

> all 60 skills surfaced, all 15 instructions were active in context, none of the 15 slash
commands were reachable, and both registered MCP servers answered a protocol
handshake — 6 tools from Flint, 24 from Playwright.

Scout-specific notes, last verified 2026-09-13:

- **Slash commands do not reach Scout.** It has no command surface for plugin
  prompts. Every command has an equivalent skill you can ask for by name, so
  nothing is lost in capability — but the commands themselves are absent rather
  than merely undocumented.
- **Scout should use the Copilot CLI installation.** A test found a stale
  Scout-local `v0.1.0` alongside the then-current `v0.2.0` Mall installation under
  `~/.copilot`. The duplicate was removed. Enable **Load Copilot CLI skills**
  in Scout's UI, then confirm Scout loaded the shared path and version before
  activation or MCP registration.
- **MCP servers need one extra step.** CLI and VS Code read `plugin.json`
  directly. Scout keeps its own registry and ignores that manifest, so the
  servers must be registered from the loaded `setup-dependencies` skill.
  Skipping it leaves every skill loaded and every server it calls missing.

## Install

Two steps. The first runs once per machine, the second once per app. Scout needs
a few extra steps of its own, and a final section covers optional tools; none of
those tools are needed to get started.

### 1. Install the plugin

Use Alex Mall for normal installation. Direct source installation is deprecated;
its command remains below only for explicitly selected temporary testing.

Every skill is available in Copilot CLI, VS Code, Microsoft Scout, and the
GitHub Copilot app from the user-level installation. Scout should reuse the
Copilot CLI plugin under `~/.copilot`; do not maintain a second ONE installation
under `~/.scout/copilot`. Enable **Load Copilot CLI skills** in Scout's UI so it
discovers the shared plugin.

#### Mall option

To install the reviewed release, use Alex Mall.
If it is not already registered, add its source first:

```powershell
copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall
```

Then install from the Mall:

```powershell
copilot plugin install alex-act-one@alex-mall
```

The Mall entry tracks the reviewed release and keeps the installed name stable.
It is the recommended path.

#### Repository source (deprecated)

For explicitly selected candidate testing while this path still works:

```powershell
copilot plugin install fabioc-aloha/Alex_ACT_ONE
```

This installs repository source, which can include unreleased changes, without
marketplace registration. Read the
[observed warning and candidate boundaries](#testing-the-repository-candidate)
before choosing it. Documentation or help listing the command does not override
its runtime deprecation warning.

### 2. Turn on the always-on instructions, once in each app

Skills wait until something calls them. Instructions are different: they shape
every response, so they are written into the profile of the app you are using
rather than loaded from the plugin. Each app keeps its own profile, so run
activation in each app where you want the behavior.

| App | What to run |
| --- | --- |
| Copilot CLI | `/alex-act-one bootstrap-core` |
| VS Code with GitHub Copilot Chat | `/alex-act-one bootstrap-core` |
| Microsoft Scout | Ask for the `bootstrap-core` skill, or invoke it by name from the skill list |
| GitHub Copilot app | Ask for the `bootstrap-core` skill, or invoke it by name from the skill list |

When a host's setup requirements are unclear, start with its no-write readiness
report. It names the activation target and the steps that only the host can
complete; it does not turn on instructions or claim the host observed them.

```text
node <this-skill>/scripts/host-readiness.cjs --host scout
```

Activation previews every instruction file and waits for your approval before
writing anything. Running it again reports no changes.

In version `0.9.0`, modified or unowned destination files block
the entire activation before any writes. Back up and review the named conflicts;
only a separately approved `--overwrite-conflicts` preview/apply may replace or
adopt them. See [the conflict procedure](../skills/bootstrap-core/SKILL.md#instruction-conflicts).
Reinstall automation does not bypass that guard.

To check where a given app writes them, run activation without approving. It
prints the exact target directory first.

### What you get after each step

| After | Skills available | Instructions active |
| --- | --- | --- |
| Step 1 | Every app | None |
| Step 2 in one app | Every app | That app only |
| Step 2 in each app you use | Every app | Every app you ran it in |

Step 1 alone is a complete, working install. Step 2 adds the always-on
behavior, and skipping it costs you nothing else.

### Using Claude Code instead?

The skills travel. They follow the Agent Skills open standard, which Claude
Code also implements: each skill is a folder holding a `SKILL.md` whose
frontmatter carries a `name` and a `description`, and that is the shape Claude
Code loads. (Claude Code is Anthropic's terminal agent, a different tool from
the Muse assistant; the separate Muse edition of this pack lives at
[Alex_ACT_ONE_Muse](https://github.com/fabioc-aloha/Alex_ACT_ONE_Muse).)

Clone this repo, then copy the skill folders into Claude Code's personal
skills directory, plus the shared scripts where the skill scripts look for
them:

```bash
git clone https://github.com/fabioc-aloha/Alex_ACT_ONE.git
mkdir -p ~/.claude/skills ~/.claude/scripts
cp -r Alex_ACT_ONE/skills/* ~/.claude/skills/
cp -r Alex_ACT_ONE/scripts/* ~/.claude/scripts/
```

For a single project, copy into that project's `.claude/skills/` instead,
with `scripts/` beside it at `.claude/scripts/`. Claude Code loads a skill
automatically when a request matches its description, or you invoke one
directly as `/skill-name`.

What does not transfer: the plugin install, the 15 always-on instructions,
and the 15 slash commands are Copilot-format. Claude Code's always-on
equivalent is `CLAUDE.md`; the texts in `instructions/` can be adapted into
one by hand. The two MCP servers are standard stdio servers and can be
registered with `claude mcp add`, using the commands in `plugin.json` pointed
at your clone. Until they are, the chart and browser-check skills
still guide the work but have no rendering back end to call.

One honesty note: this pack is tested on its Copilot hosts, not on Claude
Code. The format is shared and the skills are plain markdown and scripts, so
they load; treat your first runs as an evaluation anyway. The
[evaluation guide](launch/evaluation-guide.md) works here too.

### On Microsoft Scout, register the MCP servers

Only on Scout, and only if you want charts, browser verification, or image
generation. Copilot CLI and VS Code read the servers from `plugin.json` and need
nothing extra; Scout keeps its own registry and ignores that manifest.

Ask Scout for the `setup-dependencies` skill by name. Slash commands do not
exist on this surface. From the skill copy Scout loaded, run the registration
preview:

```text
node <this-skill>/scripts/register-scout-mcp.mjs
```

The preview prints its resolved plugin root, the Scout registry path, and one
line per server. Confirm that plugin root is the same copy and version Scout
served above. If it is not, stop rather than registering servers from the wrong
version.

After reviewing the preview, apply it:

```text
node <this-skill>/scripts/register-scout-mcp.mjs --apply
```

The script backs up the existing registry and merges rather than replaces, so
other servers remain untouched. Fully quit and restart Scout afterwards. A new
conversation is not enough because tools are discovered during the launch
handshake.

After upgrading to the reviewed Flint 1.0.1 runtime, confirm its expected tools:

- `compile_chart`
- `show`
- `list_chart_types`
- `list_themes`
- `render_chart`
- `validate_chart`
- `validate_board`
- `list_interaction_presets`
- `get_flint_skill`

Without this step every skill still loads, but the tools those skills call are
missing, which looks like a broken package rather than an unregistered one.

### Optional: extra tools for a few skills

Most of this plugin needs nothing but Node. The large majority of its skills run
with no external tools at all, and nothing below is needed to start.

Flint is reviewed at `flint-chart-mcp@1.0.1` with independently exact-pinned
`flint-chart@1.0.1`. Upgrade the plugin before the shared runtime: older launchers
correctly refuse a mismatched version. From the updated installed package,
preview `skills/setup-dependencies/scripts/provision-runtime.mjs --server flint`,
then apply the same selection after consent. This does not change Playwright.
Reload the host to discover the new validated `show` interface.

If Microsoft proxy metadata points tarballs at a backend feed that npm policy
blocks directly, do not enable remote fetching or edit npm configuration. With
installation consent, npm 12+ routes the confirmed backend prefix automatically
when the configured registry is exactly the HTTPS Microsoft packagefeedproxy npm
endpoint. The preview names the detected prefix, registry, runtime, and packages.
`--registry-tarball-prefix` overrides detection for a separately confirmed prefix.

In version `0.9.0`, dependency checks distinguish installed
directories, exact version matches, and bounded launch probes. Host connection
remains unobserved until checked in that host. Checker, provisioner, and launcher
share the runtime-root selection; see
[readiness and alternate runtimes](../skills/setup-dependencies/SKILL.md#check-first).
Known Windows npm tool shims are resolved to their package's Node entrypoint
without shell argument concatenation.

| If you want to... | You also need | Get it |
| --- | --- | --- |
| Convert documents (Word, HTML, email, plain text) | Pandoc | `winget install JohnMacFarlane.Pandoc`, `brew install pandoc`, or `apt install pandoc` |
| Render Mermaid diagrams into Word or HTML output | Mermaid CLI | `npm install -g @mermaid-js/mermaid-cli@12.0.0` |
| Export SVG banners and figures as PNG | svgexport | `npm install -g svgexport@0.4.2` |
| Annotate a screenshot | Pillow | `pip install Pillow` |
| Render charts | Flint MCP server | Ask for the `setup-dependencies` skill |
| Check rendered output in a browser | The `alex-playwright` MCP server, or your host's own browser tools | Ask for the `setup-dependencies` skill |

The two MCP servers are not equally important. Only Flint is required for the
skill that uses it: without it, chart rendering cannot run and there is no
substitute. Playwright has one — several hosts provide their own browser tools —
so browser verification has an alternate path.

That fallback has a limit worth knowing before you rely on it. A host can have a
browser and still refuse to open `file://`, which is the case that matters for
checking an artifact you just wrote to disk. VS Code documents native browser
verification, and current Copilot CLI releases include a browser-use plugin.
Local-file, console, remote, and authentication parity still depend on the
host, harness, and policy; retain the fallback for unavailable or unverified cases.
The package registers its own server as `alex-playwright` — a distinct name, so
it sits alongside a host's built-in browser tools rather than shadowing them.

To see what you already have and what any gap costs you, ask for the
`setup-dependencies` skill by name. Copilot CLI and VS Code also expose it as
`/alex-act-one setup-dependencies`.

It reports what is present, what is missing, and what each missing piece
unlocks. It installs nothing without asking, and it never runs a system package
manager on your behalf.

If you skip this entirely, every skill that needs one of these will tell you
exactly which tool it wants and how to install it, at the moment you need it.

### Scripts for reinstalling and optional setup

Run these scripts from the repository checkout. The optional installer and
expanded marketplace checks ship in `v0.5.0`.

#### Reinstall and verify ONE

Run the current checkout's
[`install-and-check.ps1`](../install-and-check.ps1) without switches to
connect Alex Mall if missing, refresh all registered marketplace catalogs,
and report the installed version, if any, plus the latest version in Mall and
the installed/missing dependency versions:

```powershell
.\install-and-check.ps1
```

Default mode changes only marketplace registration/catalog caches, not plugins
or instructions or tools. It adds only `alex-mall` and preserves existing/default
and unrelated registrations. Full reporting requires the Copilot CLI, Node
and npm; a missing Python or system tool is reported without installing it.

To install or update the latest Mall version, close hosts that may lock the
plugin, then opt in:

```powershell
.\install-and-check.ps1 -Apply
```

`-Apply` installs when absent or invokes native update
for an enabled Mall installation, including a matching version. The latest
stable version comes from the registered GitHub marketplace's catalog, not
the checkout's metadata. A missing, ambiguous or invalid catalog version,
failed refresh/update, or mismatched installed inventory stops before activation.
An installed version ahead of Mall is preserved rather than downgraded.
Duplicate, cross-source, disabled or unregistered package state requires
explicit resolution; the helper never uninstalls first.

After verifying inventory and the installed manifest, `-Apply` activates only
the installed package's canonical instructions and checks their bootstrap
receipt. Conflicts are not overwritten. Restart the host after success;
the script does not prove that the restarted host loaded instructions.
`-CopilotHome` selects the profile explicitly; otherwise `COPILOT_HOME` is
used when set, then `~/.copilot`. Every operation is scoped to that home,
and the inherited environment value is restored afterward.

The simplified interface is an unreleased source change: use the current
checkout, not the frozen `0.9.6` helper. It needs neither a refresh switch
nor a version pin. Once plugin/bootstrap succeeds, it sets up dependencies
from that installed package's registry and launcher. A later dependency failure
does not undo a successful plugin stage; it stops full setup explicitly.
This is not transactional native-CLI rollback.

#### Install or check optional dependencies

The same [`install-and-check.ps1`](../install-and-check.ps1) reports installed,
missing or mismatched dependency versions by default. Review its configured
registry and installation paths before applying:

```powershell
.\install-and-check.ps1
.\install-and-check.ps1 -Apply
```

The helper reads pins from the installed plugin, not the checkout. If no plugin
is installed, default mode labels checkout pins as planning only; `-Apply`
installs the plugin before selecting its dependency owner. Flint, Playwright, and JSZip go
into ONE's private runtime; Mermaid CLI and svgexport use npm's global prefix.
It leaves the registry and npm policy unchanged and does not install
companion plugins. Missing Pandoc and Pillow are included only with `-Apply`:
Pandoc uses Windows winget, and Pillow uses the selected existing Python's pip.
No Python installation, silent upgrade of existing Pandoc/Pillow, forced
elevation, agreement acceptance or package-manager policy bypass is added.
Select Python with `-PythonCommand`; its environment and configured pip source
remain authoritative. Missing Python/winget or unsupported automatic system
installation stops before any dependency installation, with guidance.
`-RuntimeRoot` overrides
`ALEX_ACT_ONE_RUNTIME_ROOT`; otherwise the shared default private runtime is
used. Install the matching reviewed plugin before applying its runtime pins:
older launchers intentionally reject newer MCP package versions. The `0.9.6`
release reuses the reviewed `0.9.5` pins.

Check existing package versions, MCP launchers, and actual Mermaid/SVG-to-PNG
rendering without reinstalling:

```powershell
.\install-and-check.ps1 -VerifyOnly
```

To use an existing compatible browser instead of downloading Puppeteer's browser,
pass its absolute executable path explicitly:

```powershell
$browser = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
.\install-and-check.ps1 -VerifyOnly -BrowserExecutablePath $browser
```

The option works with preview, `-Apply`, and `-VerifyOnly`. Invalid paths stop
before any installation. `-VerifyOnly` requires an installed plugin and adds
strict dependency readiness checks without package downloads or activation;
it still refreshes the normal marketplace catalogs. The selected path is passed only to renderer processes;
it does not configure the host or change the parent environment. An existing
`PUPPETEER_EXECUTABLE_PATH` is used when the option is omitted and is also validated.
No browser is selected automatically, and a supplied path does not prove browser
compatibility: the render checks must still pass.

With npm 12, the Microsoft proxy can advertise tarball URLs on a different
Microsoft host and trigger `EALLOWREMOTE`. The updated checkout detects the
configured `https://packagefeedproxy.microsoft.io/npm/` registry and selects
its confirmed backend prefix before installation. Preview shows
`detected Microsoft proxy`; ordinary `-Apply` uses per-command routing.
It does not infer a corporate network, change the registry or npm policy,
or route other endpoints automatically. This behavior ships in `0.9.6`;
the immutable `0.9.5` payload retains the older explicit-only behavior.

To override detection or select a separately confirmed prefix for another
registry, use the existing explicit option:

```powershell
$feed = 'https://ms-feed-25.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/'
.\install-and-check.ps1 -RegistryTarballPrefix $feed
.\install-and-check.ps1 -Apply -RegistryTarballPrefix $feed
```

Combine `-BrowserExecutablePath $browser` with `-RegistryTarballPrefix $feed`
when both are needed. Fetch-policy failures retain npm's error and explain the
explicit routing option; a continued failure with routing enabled stops without
broadening the prefix or retrying automatically. Access-denied cleanup errors
suggest closing applications using the affected package and checking permissions.
The helper does not delete package directories to recover from these errors.

This routing does not switch registries or relax `allow-remote`. A failed
install may leave partial package state. If npm blocks Puppeteer's browser
setup scripts, package installation can succeed while rendering still fails.
The readiness check reports that failure rather than claiming success.
Browser setup is a separate decision: its downloads do not use the npm feed,
and svgexport's pinned dependency requests an old, deprecated browser build.
Do not enable lifecycle scripts globally to suppress the warning.

The current release's exact npm pins were verified through
`https://packagefeedproxy.microsoft.io/npm/`. Detection is limited to that
configured endpoint and the confirmed backend prefix, with an npm 12+ guard
before dependency apply. Default reports and `-VerifyOnly` fetch no packages and do not need
automatic routing support. Explicit prefixes retain their validation.
A new backend is not silently trusted: continued fetch-policy errors stop,
without retries or policy changes.

Pandoc and Pillow support particular capabilities, not core reasoning.
To set them up separately instead of using the unified `-Apply` path:

```powershell
winget install --id JohnMacFarlane.Pandoc --exact
python -m pip install Pillow
```

Optional visual companions and Microsoft ecosystem plugins remain owned by
[their opt-in workflows](../skills/setup-dependencies/SKILL.md#what-is-optional).
ONE no longer bundles an image-generation provider. Upgrade does not delete
old private packages, credentials, or manually registered external servers.

See the [release checklist](../RELEASE-CHECKLIST.md) for the verification steps
and installation boundaries.
