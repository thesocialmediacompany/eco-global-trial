"use client";

/**
 * A submit button that asks for confirmation before its form's server action
 * runs. For destructive, hard-to-undo actions (cancelling an order restocks
 * inventory and cancels the courier booking).
 *
 * The confirm happens in the button's own onClick and only calls
 * preventDefault to STOP a declined submit — it never changes state or
 * unmounts the form, so the server action dispatches normally when confirmed.
 */
export function ConfirmSubmitButton({
  action,
  confirmMessage,
  children,
  className,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm(confirmMessage)) e.preventDefault();
        }}
        className={className}
      >
        {children}
      </button>
    </form>
  );
}
