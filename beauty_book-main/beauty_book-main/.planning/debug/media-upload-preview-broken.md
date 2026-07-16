---
status: diagnosed
trigger: "Les medias importés ne s'affichent pas et je n'arrive pas à publier"
created: 2026-06-30T11:36:00Z
updated: 2026-06-30T11:36:00Z
---

## Current Focus

hypothesis: Multiple root causes identified — (1) global express.json() 100KB limit blocks video uploads, (2) missing try/catch in upload handlers leaves UI in broken state
test: Read server.js middleware ordering + Publication.jsx upload handlers
expecting: Confirmed — both issues verified in code
next_action: Present diagnosis to user

## Symptoms

expected: User selects video from gallery → video uploads → form.video_url set → video preview displayed in main area → user can publish
actual: Video selected → thumbnail appears in bottom-left corner → main preview stays dark with Camera icon → user cannot publish
errors: None shown to user (errors silently swallowed)
reproduction: Select a video file from gallery in the Publication wizard
started: Likely always broken for video files

## Eliminated

- hypothesis: CORS issue between frontend (port 5173) and backend (port 3000)
  evidence: server.js line 17-24 shows CORS configured to allow all origins in dev mode (callback(null, true))
  timestamp: 2026-06-30T11:36:00Z

- hypothesis: Supabase Storage bucket misconfiguration
  evidence: User confirmed uploads bucket exists and is public; upload endpoint returns 200 when tested directly
  timestamp: 2026-06-30T11:36:00Z

- hypothesis: Video URL returned by upload is invalid
  evidence: Backend (server.js:85-86) uses getPublicUrl(data.path) which returns valid URL format. Issue is upload never completes for videos.
  timestamp: 2026-06-30T11:36:00Z

## Evidence

- timestamp: 2026-06-30T11:36:00Z
  checked: backend/src/server.js lines 31, 72-91
  found: Global middleware `app.use(express.json())` at line 31 has DEFAULT 100KB body limit. Route-specific `express.json({ limit: '50mb' })` at line 72 NEVER executes for upload requests because global middleware processes body first and rejects anything >100KB
  implication: Video files base64-encoded are easily several MB → global middleware rejects with 413 → error handler returns 500 → frontend upload fails silently

- timestamp: 2026-06-30T11:36:00Z
  checked: src/pages/pro/Publication.jsx lines 239-254 (handleVideoFileChange)
  found: NO try/catch around await uploadFile({ file }). If uploadFile throws, execution stops immediately — setUploading(false) never runs, setForm() never runs, setRecordingMode(null) never runs
  implication: UI stuck with upload spinner, form.video_url never populated, preview stays dark

- timestamp: 2026-06-30T11:36:00Z
  checked: src/pages/pro/Publication.jsx lines 204-215 (handleFileChange)
  found: Same missing try/catch pattern — if uploadFile throws, setUploading(false) never called, images never added to form
  implication: Image uploads also fail silently for large files (any image > ~75KB after base64 encoding)

- timestamp: 2026-06-30T11:36:00Z
  checked: src/pages/pro/Publication.jsx lines 763-776 (preview rendering)
  found: Preview condition `form.video_url ? <video> : form.images.length > 0 ? <img> : <Camera/>` — since form.video_url is never set (upload fails), falls through to Camera icon
  implication: Main area shows Camera icon, only bottom-left thumbnail shows (from local blob URL captureVideoThumb)

- timestamp: 2026-06-30T11:36:00Z
  checked: src/pages/pro/Publication.jsx lines 1498-1501 (step 5 preview)
  found: Final publish step uses `<ImageSlider images={form.images}/>` — NO video preview. If user uploaded only video (no images), shows "Ajoutez des photos" empty state
  implication: Even if video uploaded successfully, step 5 preview doesn't show it — user sees empty state and thinks nothing worked

- timestamp: 2026-06-30T11:36:00Z
  checked: src/pages/pro/Publication.jsx line 369 (publish function)
  found: `publish` calls `onPublish({ ...form, status: "publie" })` but form.video_url is undefined (upload failed), form.images is empty (no images added)
  implication: handlePublish receives form with no media → Reel.create may fail or create empty publication

## Resolution

root_cause: >
  THREE BUGS working together:

  BUG 1 (BLOCKER): backend/src/server.js line 31 — Global `app.use(express.json())` uses default 100KB body limit.
  The upload route at line 72 specifies `express.json({ limit: '50mb' })` but this route-level middleware
  NEVER RUNS because the global middleware processes the request first and rejects bodies >100KB.
  Video files base64-encoded are several MB → global middleware errors → upload always fails for videos.
  Small images (<75KB) work because they fit under 100KB after base64 encoding.

  BUG 2 (CRASH): src/pages/pro/Publication.jsx lines 239-254 — `handleVideoFileChange` has NO try/catch.
  When uploadFile throws (due to Bug 1), the async function crashes: setUploading(false) never runs
  (spinner stays), setForm() never runs (video_url stays empty), setRecordingMode(null) never runs.
  Same bug at lines 204-215 in `handleFileChange`.

  BUG 3 (UX): src/pages/pro/Publication.jsx lines 1498-1501 — Step 5 preview uses ImageSlider with
  form.images only, never shows form.video_url. Even if upload worked, video-only publications
  show empty "Ajoutez des photos" state at final step.

fix: >
  Fix 1: In backend/src/server.js, increase global JSON limit OR exclude /api/upload from global parsing:
  Option A: Change line 31 to `app.use(express.json({ limit: '50mb' }));`
  Option B (better): Remove route-level express.json at line 72, move /api/upload BEFORE global json parser at line 31, or use express.json with high limit only on that route.
  Simplest: change line 31 to `app.use(express.json({ limit: '50mb' }));`

  Fix 2: Wrap upload calls in try/catch in handleVideoFileChange and handleFileChange:
  ```
  const handleVideoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const localUrl = URL.createObjectURL(file);
    captureVideoThumb(localUrl);
    try {
      const { file_url } = await uploadFile({ file });
      setForm(f => ({ ...f, video_url: file_url, images: f.images.length === 0 ? [] : f.images }));
    } catch (err) {
      console.error('[handleVideoFileChange] Upload failed:', err);
      alert("L'upload de la vidéo a échoué. Vérifiez la taille du fichier.");
    }
    setUploading(false);
    setRecordingMode(null);
  };
  ```

  Fix 3: In step 5 preview (line 1498-1501), show video if form.video_url exists:
  ```
  <div className="rounded-3xl overflow-hidden h-52 border border-gray-100">
    {form.video_url ? (
      <video src={form.video_url} className="w-full h-full object-cover" />
    ) : (
      <ImageSlider images={form.images} style={getImageStyle()} />
    )}
  </div>
  ```

  Fix 4 (recommended): Add the same try/catch pattern to handleFileChange (lines 204-215).

verification: User should: (1) Select video from gallery → should see video in main preview area, (2) Click "Publier" → should create publication with video, (3) Test with large images (>100KB) to confirm they also work
files_changed: ["backend/src/server.js", "src/pages/pro/Publication.jsx"]
