import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Settings } from "lucide-react";

interface ApiKeyConfigProps {
  onApiKeySubmit?: (apiKey: string, region: string) => void;
}

export function ApiKeyConfig({ onApiKeySubmit }: ApiKeyConfigProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [region, setRegion] = useState("centralindia");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setMessage("La API Key es requerida");
      return;
    }

    // Aquí se podría guardar en localStorage o enviar al backend
    localStorage.setItem("AZURE_API_KEY", apiKey);
    localStorage.setItem("AZURE_REGION", region);
    
    setMessage("✅ API Key guardada correctamente");
    
    if (onApiKeySubmit) {
      onApiKeySubmit(apiKey, region);
    }

    setTimeout(() => {
      setOpen(false);
      setMessage("");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="absolute top-4 right-4"
          title="Configurar API Key de Azure"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Azure Translator</DialogTitle>
          <DialogDescription>
            Ingresa tu API Key y región de Azure Translator
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm">
              <p className="font-semibold mb-2">¿Cómo obtener una API Key?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Ve a <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Azure Portal</a></li>
                <li>Crea o selecciona un recurso de "Translator"</li>
                <li>Copia tu API Key de la sección "Keys and Endpoint"</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              placeholder="Pega tu API Key aquí"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="region">Región</Label>
            <Input
              id="region"
              placeholder="ej: centralindia, eastus"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          {message && (
            <Alert className={message.includes("✅") ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              <AlertDescription className="text-sm">{message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
