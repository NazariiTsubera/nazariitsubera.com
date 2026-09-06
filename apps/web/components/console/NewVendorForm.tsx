"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { post } from "./api";

type Market = { id: string; name: string };

const LAST_MARKET_KEY = "console:lastMarketId";

export function NewVendorForm({ markets, consentText }: { markets: Market[]; consentText: string }) {
  const router = useRouter();
  const [marketId, setMarketId] = useState(() =>
    typeof window === "undefined" ? "" : (localStorage.getItem(LAST_MARKET_KEY) ?? ""),
  );
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const { id } = await post<{ id: string }>("/api/console/vendors", {
        businessName: form.get("businessName"),
        contactName: form.get("contactName") || null,
        phone: form.get("phone"),
        instagramHandle: form.get("instagramHandle") || null,
        marketId: marketId || null,
        bestSellerNote: form.get("bestSellerNote") || null,
        consent,
      });
      if (marketId) localStorage.setItem(LAST_MARKET_KEY, marketId);
      router.push(`/console/${id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save");
      setPending(false);
    }
  }

  return (
    <main className="p-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 pb-24">
        <label className="ui-label">
          Business name
          <input name="businessName" required autoFocus className="ui-field" />
        </label>
        <label className="ui-label">
          Phone
          <input name="phone" type="tel" inputMode="tel" required placeholder="(210) 555-0123" className="ui-field" />
        </label>
        <label className="ui-label">
          Contact name
          <input name="contactName" className="ui-field" />
        </label>
        <label className="ui-label">
          Market
          <select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="ui-field">
            <option value="">Not at a market</option>
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </label>
        <label className="ui-label">
          Instagram
          <input name="instagramHandle" placeholder="@handle" className="ui-field" />
        </label>
        <label className="ui-label">
          Best seller
          <input name="bestSellerNote" placeholder="Which is your best seller?" className="ui-field" />
        </label>

        <label className="ui-card flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-6 shrink-0"
            required
          />
          <span>{consentText}</span>
        </label>

        {error ? <p className="ui-error">{error}</p> : null}

        <button type="submit" disabled={pending || !consent} className="ui-btn ui-btn-lg ui-btn-primary">
          {pending ? "Saving…" : "Start capture"}
        </button>
      </form>
    </main>
  );
}
