import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { PRICE, type DownloadOption } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = Pick<ButtonProps, "variant" | "size" | "className"> & {
  option?: DownloadOption;
  label?: string;
};

/** Primary purchase call-to-action: leads to the checkout page. */
export function DownloadButton({ variant = "hero", size = "xl", className }: Props) {
  return (
    <Link to="/kaufen" className={cn(buttonVariants({ variant, size }), className)}>
      <ShoppingCart />
      Jetzt kaufen – {PRICE.label}
    </Link>
  );
}

export { DownloadButton as BuyButton };
