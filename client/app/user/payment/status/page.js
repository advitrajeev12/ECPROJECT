import { Suspense } from "react";
import PaymentStatus from "@/components/features/checkout/PaymentStatus";

// PaymentStatus uses useSearchParams() internally.
// Wrapping in <Suspense> prevents Next.js from forcing the entire
// layout into dynamic rendering mode, which caused page-wide reloads.
export default function StatusPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
        }>
            <PaymentStatus />
        </Suspense>
    );
}
