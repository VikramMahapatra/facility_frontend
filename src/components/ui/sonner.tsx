import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      expand={false}
      richColors   // ⭐ REQUIRED for success/error colors
      offset={{ bottom: 16, right: 0 }}
      toastOptions={{
        classNames: {
          // ⭐ DO NOT override background here
          toast: "rounded-xl shadow-lg border",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
