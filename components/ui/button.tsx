import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import { Alert } from "./alert";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

const AuthButton = ({
  className,
  variant,
  size,
  onClick,
  children,
  ...props
}: ButtonProps) => {
  const [loggedInUser] = useAuthState(auth);
  const router = useRouter();
  const [openAlert, setOpenAlert] = React.useState(false);

  return (
    <>
      <Button
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={() => {
          if (!loggedInUser) {
            setOpenAlert(true);
          } else onClick?.();
        }}
        {...props}
      >
        {children}
      </Button>
      <Alert
        messenger="Đăng Nhập"
        desc="Bạn phải đăng nhập để thực hiện chức năng này"
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        onContinue={() => {
          setOpenAlert(false);
          router.push("/login");
        }}
      />
    </>
  );
};

export { Button, buttonVariants, AuthButton };
