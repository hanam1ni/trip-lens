import { Sun } from "lucide-react";
import { CARD } from "../../lib/style";
import { IconTile } from "../ui";

export const FreeDay = () => (
  <div className={`${CARD} flex items-center gap-3`}>
    <IconTile icon={Sun} tone="accent" size="lg" />
    <div>
      <p className="font-bold">Free day</p>
      <p className="text-sm text-muted">Nothing planned. Wander, rest, or go back to a favourite.</p>
    </div>
  </div>
);
