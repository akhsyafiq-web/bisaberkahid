"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "@/hooks/use-toast";
import { useWallets, useTransferBalance } from "@/hooks/use-wallets";
import { formatCurrency, cn } from "@/lib/utils";
import type { Wallet } from "@/types";

/** Bottom sheet to move part of a wallet's balance to another wallet. */
export function TransferSheet({
  open,
  onClose,
  wallet,
}: {
  open: boolean;
  onClose: () => void;
  wallet: Wallet;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Pindahkan saldo">
      {/* Fresh mount per open so the form always starts empty. */}
      {open && <TransferBody wallet={wallet} onClose={onClose} />}
    </BottomSheet>
  );
}

function TransferBody({ wallet, onClose }: { wallet: Wallet; onClose: () => void }) {
  const { data: wallets } = useWallets();
  const transfer = useTransferBalance();
  const [amount, setAmount] = useState(0);
  const [toId, setToId] = useState<string | null>(null);

  const balance = Number(wallet.current_balance);
  const targets = (wallets ?? []).filter((w) => w.id !== wallet.id);
  const target = targets.find((w) => w.id === toId);
  const tooMuch = amount > balance;
  const valid = amount > 0 && !tooMuch && !!target;

  const submit = async () => {
    if (!target) return;
    try {
      await transfer.mutateAsync({ fromWalletId: wallet.id, toWalletId: target.id, amount });
      toast.success(`${formatCurrency(amount)} dipindahkan ke ${target.name}`);
      onClose();
    } catch (e) {
      const err = e as { code?: string; message?: string };
      toast.error(
        err.code === "PGRST202"
          ? "Fitur pindah saldo belum aktif. Jalankan database/wallet_transfer.sql di Supabase."
          : err.message || "Gagal memindahkan saldo"
      );
    }
  };

  return (
    <div className="space-y-4 pb-2">
      <div className="rounded-xl bg-gray-50 px-3.5 py-2.5">
        <p className="text-sm text-gray-600">Dari {wallet.name}</p>
        <p className="amount text-gray-900">Saldo {formatCurrency(balance)}</p>
      </div>

      <div>
        <Label htmlFor="transfer-amount">Nominal</Label>
        <CurrencyInput
          id="transfer-amount"
          value={amount}
          onChange={setAmount}
          aria-invalid={tooMuch}
        />
        {tooMuch ? (
          <p className="mt-1.5 text-sm text-error-600">Melebihi saldo dompet ini.</p>
        ) : (
          amount > 0 && (
            <p className="amount mt-1.5 text-xs text-gray-500">
              → Sisa saldo {wallet.name} {formatCurrency(balance - amount)}
            </p>
          )
        )}
      </div>

      <div>
        <Label>Ke dompet</Label>
        {targets.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada dompet lain.</p>
        ) : (
          <div className="max-h-[38vh] space-y-2 overflow-y-auto">
            {targets.map((w) => {
              const selected = w.id === toId;
              const wBalance = Number(w.current_balance);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setToId(w.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left",
                    selected ? "border-brand-300 bg-brand-25" : "border-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border",
                      selected ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300"
                    )}
                  >
                    {selected && <Check className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {w.name}
                    </span>
                    <span className="block text-xs text-gray-500">
                      Saldo {formatCurrency(wBalance)}
                      {selected && amount > 0 && !tooMuch && (
                        <span className="amount text-success-600">
                          {" "}
                          → {formatCurrency(wBalance + amount)}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button full size="lg" onClick={submit} disabled={!valid} loading={transfer.isPending}>
        Pindahkan saldo
      </Button>
    </div>
  );
}
