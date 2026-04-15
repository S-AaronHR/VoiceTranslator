import { Button } from "./ui/button";
import { MicrophoneBold, VolumeLoudBold } from "solar-icon-set";

interface SpeechControlsProps {
  showRecord?: boolean;
  showPlay?: boolean;
  isRecording?: boolean;
  isPlaying?: boolean;
  onRecord?: () => void;
  onPlay: () => void;
  disabled?: boolean;
  recordLabel?: string;
  playLabel: string;
}

export function SpeechControls({
  showRecord = false,
  showPlay = true,
  isRecording = false,
  isPlaying = false,
  onRecord,
  onPlay,
  disabled = false,
  recordLabel = "Grabar voz",
  playLabel,
}: SpeechControlsProps) {
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
            isPlaying
              ? "border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              : "border-2 border-transparent text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
          }
          title={playLabel}
          disabled={disabled}
        >
          <VolumeLoudBold size={20} />
        </Button>
      ) : null}
    </div>
  );
}