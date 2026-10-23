/** Direction hint for the ‹ › day slide; read by ::view-transition CSS on <html data-dir>. */
export const setNavDir = (d?: "prev" | "next") => {
  const h = document.documentElement;
  if (d) h.dataset.dir = d;
  else delete h.dataset.dir;
};
