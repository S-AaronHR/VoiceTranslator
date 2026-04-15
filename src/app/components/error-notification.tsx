import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorNotificationProps {
  error: string | null;
  duration?: number;
}

export function ErrorNotification({ error, duration = 5000 }: ErrorNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [error, duration]);

  if (!visible || !error) return null;

  return (
    <div className="fixed top-4 right-4 max-w-sm z-50 animate-in fade-in slide-in-from-top-2">
      <Alert variant="destructive" className="border-destructive bg-destructive/10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm ml-2">
          {error}
        </AlertDescription>
      </Alert>
    </div>
  );
}
