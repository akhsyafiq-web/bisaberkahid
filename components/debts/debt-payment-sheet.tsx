"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/use-wallets";
import { usePayDebt } from "@/hooks/use-debts";
import { formatCurrency, cn } from "@/lib/utils";
import type { Debt } from "@/types";

export function DebtPaymentSheet({
  debt,
  onClose,
}: {
  debt: Debt | null;
  onClose: () => void;
}) {
  const open = !!debt;
  const { data: wallets } = useWallets();
  const payDebt = usePayDebt();

  const [amount, setAmount] = useState(0);
  const [sources, setSources] = useState<Record<string, number>>({});

  const remaining = debt?.remaining_amount ?? 0;
  const taken = useMemo(
    () => Object.values(sources).reduce((s, v) => s + (v || 0), 0),
    [sources]
  );
  const allWallets = wallets ?? [];
  const overdraw = allWallets.some((w) => (sources[w.id] ?? 0) > Number(w.current_balance));
  const valid = amount > 0 && amount <= remaining && taken === amount && !overdraw;

  const reset = () => {
    setAmount(0);
    setSources({});
  };

  const toggleWallet = (walletId: string, balance: number) => {
    setSources((prev) => {
      const next = { ...prev };
      if (walletId in next) {
        delete next[walletId];
        return next;
      }
      const currentTaken = Object.values(prev).reduce((s, v) => s + (v || 0), 0);
      next[walletId] = Math.min(balance, Math.max(0, amount - currentTaken));
      return next;
    });
  };

  const submit = async () => {
    if (!debt) return;
    try {
      await payDebt.mutateAsync({
        debtId: debt.id,
        amount,
        sources: allWallets
          .map((w) => ({ wallet_id: w.id, amount: sources[w.id] || 0 }))
          .filter((s) => s.amount > 0),
      });
      toast.success("Pembayaran hutang berhasil dicatat!");
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mencatat pembayaran");
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Bayar hutang"
    >
      {debt && (
        <div className="space-y-4 pb-2">
          <div className="rounded-xl bg-gray-50 px-3.5 py-2.5">
            <p className="text-sm text-gray-600">{debt.creditor_name}</p>
            <p className="amount text-gray-900">Sisa {formatCurrency(remaining)}</p>
          </div>

          <div>
            <Label htmlFor="pay-amount">Nominal pembayaran</Label>
            <CurrencyInput id="pay-amount" value={amount} onChange={setAmount} />
            {amount > remaining && (
              <p className="mt-1.5 text-sm text-error-600">
                Tidak boleh melebihi sisa hutang.
              </p>
            )}
          </div>

          <div>
            <Label>Sumber dompet</Label>
            <div className="space-y-2">
              {allWallets.map((w) => {
                const selected = w.id in sources;
                const balance = Number(w.current_balance);
                const insufficient = (sources[w.id] ?? 0) > balance;
                return (
                  <div
                    key={w.id}
                    className={cn(
                      "rounded-xl border bg-white p-2.5",
                      selected ? "border-brand-300" : "border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        disabled={balance <= 0 && !selected}
                        onClick={() => toggleWallet(w.id, balance)}
                        className={cn(
                          "grid size-5 place-items-center rounded border",
                          selected ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300",
                          balance <= 0 && !selected && "opacity-40"
                        )}
                      >
                        {selected && <Check className="size-3.5" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{w.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(balance)}</p>
                      </div>
                      {insufficient && <Badge variant="error">Tidak cukup</Badge>}
                    </div>
                    {selected && (
                      <div className="mt-2">
                        <CurrencyInput
                          value={sources[w.id] || 0}
                          onChange={(v) => setSources((s) => ({ ...s, [w.id]: v }))}
                          aria-invalid={insufficient}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Button full size="lg" onClick={submit} disabled={!valid} loading={payDebt.isPending}>
            {amount > 0 && taken !== amount
              ? `Alokasikan ${formatCurrency(amount - taken)} lagi`
              : "Konfirmasi pembayaran"}
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}
