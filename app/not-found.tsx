import Link from "next/link";
import { brand } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center bg-paper px-6 text-center text-ivory">
      <div>
        <p className="font-sans text-[0.68rem] uppercase tracking-[0.42em] text-brass">Missing</p>
        <h1 className="mt-4 font-arabic-display text-5xl">هذه الصفحة ليست في الدار</h1>
        <Link href="/" className="mt-8 inline-block text-brass transition-colors hover:text-ivory">
          العودة إلى {brand.name}
        </Link>
      </div>
    </div>
  );
}
