import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { DOWNLOADS, isPlaceholderUrl, type DownloadOption } from "@/lib/site";

type Props = Omit<ButtonProps, "onClick"> & {
  option?: DownloadOption;
  label?: string;
};

/**
 * Starts a download with a short loading state. While the release URL is still
 * a placeholder, it tells the visitor honestly that the link is not live yet.
 */
export function DownloadButton({
  option = DOWNLOADS.portable,
  label = "Software herunterladen",
  variant = "hero",
  size = "xl",
  ...rest
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (isPlaceholderUrl(option.url)) {
        toast("Download-Link wird vorbereitet", {
          description: `${option.file} ist noch nicht öffentlich verlinkt. Bitte kontaktieren Sie uns für den Zugang zu einer konfigurierten Version.`,
        });
        return;
      }
      toast.success("Download gestartet", { description: option.file });
      window.location.href = option.url;
    }, 650);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" /> : <Download />}
      {loading ? "Wird vorbereitet …" : label}
    </Button>
  );
}
