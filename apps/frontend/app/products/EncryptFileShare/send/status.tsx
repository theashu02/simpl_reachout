import { useAppSelector } from "@/lib/store/hooks";
import BlinkIcon from "../components/BlinkIcon";

export default function Status() {
  const { roomId, status } = useAppSelector((state) => state.room);
  console.log(roomId);

  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-3xl">
      <div className="">
        <p className="text-xs font-semibold text-muted-foreground tracking-[0.3em] uppercase">Realtime status</p>
        <p className="text-base font-normal text-foreground tracking-[0.2em] uppercase">{status}</p>
      </div>

      {roomId ? (
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-600 shadow-[0_0_10px_-4px_rgba(16,185,129,0.3)]">
          <BlinkIcon />
          Room Ready
        </div>
      ) : (
        <div className="rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">ID PENDING</div>
      )}
    </div>
  );
}
