const pendingReleases = new WeakMap();

export function acquireWebGLContext(canvas, options) {
  clearTimeout(pendingReleases.get(canvas));
  pendingReleases.delete(canvas);
  try { return canvas.getContext('webgl2', options); }
  catch { return null; }
}

export function releaseWebGLContext(canvas, gl) {
  clearTimeout(pendingReleases.get(canvas));
  // StrictMode replays effects on the same canvas before this timer runs.
  pendingReleases.set(canvas, setTimeout(() => {
    pendingReleases.delete(canvas);
    if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext();
  }, 0));
}
