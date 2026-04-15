import { Button } from "./ui/button";
import { MicrophoneBold, VolumeLoudBold } from "solar-icon-set";

interface SpeechControlsProps {
  showRecord?: boolean;
  showPlay?: boolean;
  isRecording?: boolean;
  isPlaying?: boolean;
  isLoadingPlay?: boolean;
  onRecord?: () => void;
  onPlay: () => void;
  disabled?: boolean;
  recordLabel?: string;
  playLabel: string;
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}

export function SpeechControls({
  showRecord = false,
  showPlay = true,
  isRecording = false,
  isPlaying = false,
  isLoadingPlay = false,
  onRecord,
  onPlay,
  disabled = false,
  recordLabel = "Grabar voz",
  playLabel,
}: SpeechControlsProps) {
  const playDisabled = disabled || isLoadingPlay || isPlaying;

  return (
    <div className="absolute bottom-4 right-4 flex gap-2">
      {showRecord && onRecord ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={onRecord}
          className={
            isRecording
              ? "animate-pulse border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-2 border-transparent text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
          }
          title={recordLabel}
          disabled={disabled}
        >
          <MicrophoneBold size={20} />
        </Button>
      ) : null}

      {showPlay ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={onPlay}
          className={
            isLoadingPlay
              ? "border-2 border-primary/50 bg-primary/10 text-primary cursor-wait"
              : isPlaying
                ? "border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-2 border-transparent text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
          }
          title={isLoadingPlay ? "Cargando audio..." : playLabel}
          disabled={playDisabled}
        >
          {isLoadingPlay ? <LoadingSpinner /> : <VolumeLoudBold size={20} />}
        </Button>
      ) : null}
    </div>
  );
}