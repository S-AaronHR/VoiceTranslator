import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  languages?: Language[];
  disabled?: boolean;
  selectedLabel?: string;
}

export function LanguageSelector({
  value,
  onChange,
  languages: serverLanguages = [],
  disabled = false,
  selectedLabel,
}: LanguageSelectorProps) {
  const selectedLanguage = serverLanguages.find((lang) => lang.code === value) || {
    code: value,
    name: value,
    nativeName: value,
  };

  const getLanguageAbbreviation = (code: string) => {
    if (code === "auto-detect") {
      return "AUTO";
    }
    const [base] = code.split("-");
    return base.toUpperCase();
  };

  const displayName = selectedLabel || selectedLanguage.nativeName || selectedLanguage.name || value;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full border-0 bg-transparent font-medium focus:ring-0">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-6 min-w-10 items-center justify-center rounded-md bg-primary/15 px-2 text-[11px] font-semibold tracking-wide text-primary">
              {getLanguageAbbreviation(value)}
            </span>
            <span>{displayName}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {serverLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span className="inline-flex h-6 min-w-10 items-center justify-center rounded-md bg-primary/15 px-2 text-[11px] font-semibold tracking-wide text-primary">
                {getLanguageAbbreviation(lang.code)}
              </span>
              <span>{lang.nativeName || lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
