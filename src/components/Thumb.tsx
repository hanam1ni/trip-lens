import images from "../data/images.json";

interface ImageMeta { file: string; source_page: string; author: string; license: string; license_url: string | null; wikidata_id: string }
const manifest = images as Record<string, ImageMeta>;

// Renders a local Wikimedia thumbnail + attribution for an item id, or nothing if there is none.
export function Thumb({ id, alt }: { id: string; alt: string }) {
  const m = manifest[id];
  if (!m) return null;
  return (
    <figure className="mb-2">
      <img
        src={`${import.meta.env.BASE_URL}images/${m.file}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="aspect-[16/9] w-full rounded-md bg-slate-100 object-cover"
      />
      <figcaption className="mt-0.5 text-[11px] leading-tight text-slate-500">
        <a href={m.source_page} target="_blank" rel="noopener noreferrer" className="underline">
          Photo: {m.author}, {m.license}
        </a>
      </figcaption>
    </figure>
  );
}
