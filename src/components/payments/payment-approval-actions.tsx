"use client";

import { useRouter } from "next/navigation";
import { Loader2, Send, ShieldCheck, ShieldX } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  approvePayment,
  rejectPayment,
  submitPaymentForApproval,
} from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type PaymentApprovalActionsProps = {
  paymentId: string;
  status: string;
};

export function PaymentApprovalActions({
  paymentId,
  status,
}: PaymentApprovalActionsProps) {
  const router = useRouter();
  const [comments, setComments] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | "submit" | null
  >(null);

  function runAction(action: "approve" | "reject" | "submit") {
    setPendingAction(action);

    startTransition(async () => {
      const result =
        action === "submit"
          ? await submitPaymentForApproval(paymentId)
          : action === "approve"
            ? await approvePayment(paymentId, { comments })
            : await rejectPayment(paymentId, { comments });

      if (result.error) {
        toast.error(result.error._global?.[0] ?? "Action failed.");
        setPendingAction(null);
        return;
      }

      toast.success(
        action === "submit"
          ? "Payment submitted for approval."
          : action === "approve"
            ? "Payment approved."
            : "Payment rejected.",
      );
      setComments("");
      setPendingAction(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {(status === "pending_approval" || status === "draft") && (
        <div className="space-y-2">
          <label
            htmlFor="approval-comments"
            className="text-sm font-medium text-slate-300"
          >
            Approval comments
          </label>
          <Textarea
            id="approval-comments"
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            className="min-h-24 border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"
            placeholder="Add context for approvers or note the reason for approval / rejection"
          />
        </div>
      )}

      {status === "draft" ? (
        <Button
          type="button"
          size="lg"
          disabled={isPending}
          onClick={() => runAction("submit")}
          className="h-11 w-full bg-green-600 text-white hover:bg-green-500"
        >
          {isPending && pendingAction === "submit" ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              Submit for Approval
            </>
          )}
        </Button>
      ) : null}

      {status === "pending_approval" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            size="lg"
            disabled={isPending}
            onClick={() => runAction("approve")}
            className="h-11 bg-green-600 text-white hover:bg-green-500"
          >
            {isPending && pendingAction === "approve" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 size-4" />
                Approve Payment
              </>
            )}
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={isPending}
            onClick={() => runAction("reject")}
            className="h-11 bg-red-600 text-white hover:bg-red-500"
          >
            {isPending && pendingAction === "reject" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <ShieldX className="mr-2 size-4" />
                Reject Payment
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
