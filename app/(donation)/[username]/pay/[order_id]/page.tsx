"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";

type ChargeResponse = {
  order_id: string;
  payment_type: string;
  qr_code_url?: string;
  deep_link_url?: string;
  va_number?: string;
  biller_code?: string;
  bill_key?: string;
};

export default function PayPage({
  params,
}: Readonly<{ params: Promise<{ username: string; order_id: string }> }>) {
  const { username, order_id } = use(params);
  const router = useRouter();
  const [result, setResult] = React.useState<ChargeResponse | null>(null);

  React.useEffect(() => {
    const raw = sessionStorage.getItem(`pay_${order_id}`);
    if (raw) {
      setResult(JSON.parse(raw));
    }
  }, [order_id]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-100 font-mono flex items-center justify-center">
        <p className="text-sm text-gray-500">Memuat data pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-mono flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border-[1px] border-black shadow-normal p-6 flex flex-col items-center gap-4">
        <h2 className="text-base font-bold text-gray-800">
          Selesaikan Pembayaran
        </h2>
        <p className="text-xs text-gray-400 font-mono">{result.order_id}</p>

        {result.qr_code_url && (
          <div className="flex flex-col items-center gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.qr_code_url}
              alt="QR Code"
              className="w-56 h-56 border-[1px] border-black"
            />
            <p className="text-xs text-gray-500">
              {result.payment_type === "qris" ? "Scan QRIS" : "Scan QR GoPay"}
            </p>
          </div>
        )}

        {result.deep_link_url && (
          <a
            href={result.deep_link_url}
            className="w-full bg-green-500 text-white text-sm font-bold text-center py-2.5 border-[1px] border-black shadow-normal active:shadow-pressed transition-all"
          >
            Buka di aplikasi GoPay
          </a>
        )}

        {result.va_number && (
          <div className="w-full border-[1px] border-black p-3 text-sm font-mono">
            <p className="text-xs text-gray-500 mb-1">Nomor Virtual Account</p>
            <p className="font-bold text-gray-800 tracking-widest">
              {result.va_number}
            </p>
          </div>
        )}

        {result.biller_code && result.bill_key && (
          <div className="w-full border-[1px] border-black p-3 text-sm font-mono space-y-1">
            <p className="text-xs text-gray-500">
              Biller Code:{" "}
              <span className="font-bold text-gray-800">
                {result.biller_code}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Bill Key:{" "}
              <span className="font-bold text-gray-800">{result.bill_key}</span>
            </p>
          </div>
        )}

        <button
          onClick={() => router.push(`/${username}`)}
          className="text-sm text-primary underline font-mono"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
