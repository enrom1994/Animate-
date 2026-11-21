// The frame audit for the money channel's 2D scenes. Reads the draw log (toon.js AUDIT) and reports, per frame:
//   error  a label covered: an opaque shape drawn after a label covers more than 20% of it (the store name under the roof)
//   error  a label cut off by the frame edge (QUICK STO)
//   warn   a label too small to read on a phone (under 22 px tall in a 1080 x 1920 frame)
//   (scenery: true marks a background sign in the world: it may pass behind walls and out of frame like any object; not checked)
//   a story label cut off while the camera is moving fast (moving: true) is a warning: it is sweeping through the frame, not framed badly
//   error  a character too small to read (a registered subject under its minimum height), or cut off by the edge
export function auditFrame(log, W = 1080, H = 1920, { moving = false, capBox = null } = {}) {   // capBox: the caption's box; nothing that matters may sit under it
  const out = [], area = b => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]), inter = (a, b) => area([Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])]);
  const onScreen = b => b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  log.forEach((e, i) => {
    const fr = e.clip || [0, 0, W, H];   // a split-screen half is its own frame
    if (capBox && (e.k === 'subject' || (e.k === 'text' && !e.scenery)) && inter(e.bb, capBox) / (area(e.bb) || 1) > .1) out.push([moving && e.k === 'text' ? 'warn' : 'error', `${e.k === 'subject' ? e.name : `label "${e.str}"`} is under the caption`]);
    if (e.k === 'text' && !e.scenery && onScreen(e.bb)) { const A = area(e.bb) || 1, vis = inter(e.bb, fr) / A;
      if (vis < .98) out.push([moving ? 'warn' : 'error', `label "${e.str}" is cut off by the frame edge (${Math.round(vis * 100)}% visible)${moving ? ' while the camera moves' : ''}`]);
      if (e.bb[3] - e.bb[1] < 22) out.push(['warn', `label "${e.str}" is ${Math.round(e.bb[3] - e.bb[1])} px tall: too small to read on a phone`]);
      let cov = 0; for (const f of log.slice(i + 1)) if (f.k === 'shape' && f.layer === e.layer) cov = Math.max(cov, inter(e.bb, f.bb) / A);
      if (cov > .2) out.push(['error', `label "${e.str}" is covered by something drawn over it (${Math.round(cov * 100)}%)`]); }
    if (e.k === 'subject' && onScreen(e.bb)) { const h = e.bb[3] - e.bb[1], vis = inter(e.bb, fr) / (area(e.bb) || 1);
      if (h < e.minH) out.push(['error', `${e.name} is ${Math.round(h)} px tall on screen: too small to read (needs ${e.minH})`]);
      if (vis < .9) out.push(['error', `${e.name} is cut off by the frame edge (${Math.round(vis * 100)}% visible)`]); } });
  return out;
}
