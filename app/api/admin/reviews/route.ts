import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { createReview } from "@/lib/db/reviews";
import {
  readAuthorName,
  readReviewBody,
  readReviewCaption,
  readSortOrder,
  readStars,
} from "@/lib/reviews/voice";
import { isReviewKind } from "@/lib/reviews/voice";

const maxImageBytes = 4 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const formData = await request.formData();
    const kindValue = String(formData.get("kind") ?? "");
    if (!isReviewKind(kindValue)) return NextResponse.json({ error: "نوع الرأي غير معروف." }, { status: 400 });
    const productId = String(formData.get("productId") ?? "");
    const sortOrder = readSortOrder(formData.get("sortOrder"));
    if (kindValue === "written") {
      const id = await createReview({
        productId,
        kind: "written",
        authorName: readAuthorName(formData.get("authorName")),
        stars: readStars(formData.get("stars")),
        body: readReviewBody(formData.get("body")),
        caption: "",
        imagePath: null,
        sortOrder,
      });
      return NextResponse.json({ id });
    }
    const imagePath = await storeScreenshot(formData.get("image"));
    try {
      const id = await createReview({
        productId,
        kind: "screenshot",
        authorName: "",
        stars: null,
        body: "",
        caption: readReviewCaption(formData.get("caption")),
        imagePath,
        sortOrder,
      });
      return NextResponse.json({ id });
    } catch (error) {
      await fs.unlink(path.join(process.cwd(), "public", imagePath)).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر حفظ الرأي.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function storeScreenshot(value: FormDataEntryValue | null): Promise<string> {
  if (!(value instanceof File) || value.size === 0) throw new Error("ارفع صورة رسالة واتساب.");
  const extension = allowedTypes.get(value.type);
  if (!extension) throw new Error("الصورة يجب أن تكون JPG أو PNG أو WebP.");
  if (value.size > maxImageBytes) throw new Error("الصورة أكبر من 4 ميغابايت.");
  const id = crypto.randomUUID();
  const directory = path.join(process.cwd(), "public", "uploads", "reviews");
  await fs.mkdir(directory, { recursive: true });
  const fileName = `${id}.${extension}`;
  await fs.writeFile(path.join(directory, fileName), Buffer.from(await value.arrayBuffer()));
  return `/uploads/reviews/${fileName}`;
}
