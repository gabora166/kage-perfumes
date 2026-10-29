import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { saveProduct } from "@/lib/db/products";
import { bottleSizes, fragranceFamilies, wearLevels } from "@/lib/catalog/types";
import type { BottleSize, FragranceFamily, ProductImageKind, ProductImages, WearLevel } from "@/lib/catalog/types";

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
    assertImage(formData.get("bottleImage"));
    assertImage(formData.get("liquidImage"));
    assertImage(formData.get("textureImage"));
    assertImage(formData.get("pyramidImage"));
    const id = String(formData.get("id") ?? "");
    const emptyImages: ProductImages = { bottle: null, liquid: null, texture: null, pyramid: null };
    const savedId = await saveProduct(readProductInput(formData, emptyImages), id || undefined);
    const images = await storeGallery(formData, savedId);
    if (images.bottle || images.liquid || images.texture || images.pyramid) {
      await saveProduct(readProductInput(formData, images), savedId);
    }
    return NextResponse.json({ id: savedId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذّر حفظ العطر.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function readProductInput(formData: FormData, images: ProductImages) {
  const family = String(formData.get("family") ?? "");
  if (!isFamily(family)) throw new Error("اختر عائلة عطرية.");
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const descriptionAr = String(formData.get("descriptionAr") ?? "").trim();
  if (nameAr.length < 2 || nameEn.length < 2 || descriptionAr.length < 8) {
    throw new Error("أكمل الاسمين والوصف.");
  }
  const offers = bottleSizes.flatMap((size) => {
    const raw = String(formData.get(`price${size}`) ?? "").trim();
    if (!raw) return [];
    const priceSar = Number(raw);
    if (!Number.isInteger(priceSar) || priceSar < 1) throw new Error("السعر يجب أن يكون رقمًا صحيحًا.");
    const rawStock = String(formData.get(`stock${size}`) ?? "").trim();
    if (!rawStock) throw new Error("أدخل المخزون لكل حجم له سعر.");
    const stockCount = Number(rawStock);
    if (!Number.isInteger(stockCount) || stockCount < 0 || stockCount > 999) {
      throw new Error("المخزون يجب أن يكون رقمًا بين 0 و 999.");
    }
    return [{ sizeMl: size as BottleSize, priceSar, stockCount, isListed: formData.get(`listed${size}`) === "on" }];
  });
  if (offers.length === 0) throw new Error("أضف سعرًا لحجم واحد على الأقل.");
  const noteTop = String(formData.get("noteTop") ?? "").trim();
  const noteHeart = String(formData.get("noteHeart") ?? "").trim();
  const noteBase = String(formData.get("noteBase") ?? "").trim();
  if (noteTop.length < 2 || noteHeart.length < 2 || noteBase.length < 2) {
    throw new Error("أكمل نوتات القمة والقلب والقاعدة.");
  }
  const season = String(formData.get("season") ?? "").trim();
  const occasion = String(formData.get("occasion") ?? "").trim();
  const sensoryVibe = String(formData.get("sensoryVibe") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim();
  const attire = String(formData.get("attire") ?? "").trim();
  const longevitySpan = String(formData.get("longevitySpan") ?? "").trim();
  const sillageSpan = String(formData.get("sillageSpan") ?? "").trim();
  if (sensoryVibe.length < 8 || sensoryVibe.length > 280) throw new Error("الوصف الحسي يجب أن يكون بين 8 و 280 حرفًا.");
  if ([mood, attire, longevitySpan, sillageSpan, season, occasion].some((value) => value.length < 2 || value.length > 80)) {
    throw new Error("أكمل الثبات والفوحان والمزاج والموسم والمناسبة والملبس.");
  }
  const sample = readSample(formData);
  return {
    nameAr,
    nameEn,
    family,
    descriptionAr,
    noteTop,
    noteHeart,
    noteBase,
    isFeatured: formData.get("isFeatured") === "on",
    isPublished: formData.get("isPublished") === "on",
    offers,
    images,
    longevity: readWearLevel(formData.get("longevity")),
    sillage: readWearLevel(formData.get("sillage")),
    longevitySpan,
    sillageSpan,
    sensoryVibe,
    mood,
    season,
    occasion,
    attire,
    samplePriceSar: sample.priceSar,
    sampleStockCount: sample.stockCount,
    sampleIsEnabled: sample.isEnabled,
  };
}

function readSample(formData: FormData): { priceSar: number | null; stockCount: number; isEnabled: boolean } {
  const isEnabled = formData.get("sampleEnabled") === "on";
  const rawPrice = String(formData.get("samplePrice") ?? "").trim();
  if (!rawPrice) return { priceSar: null, stockCount: 0, isEnabled: false };
  const priceSar = Number(rawPrice);
  if (!Number.isInteger(priceSar) || priceSar < 1) throw new Error("أكمل سعر العيّنة كرقم صحيح.");
  const rawStock = String(formData.get("sampleStock") ?? "").trim();
  if (!rawStock) throw new Error("أكمل مخزون العيّنة.");
  const stockCount = Number(rawStock);
  if (!Number.isInteger(stockCount) || stockCount < 0 || stockCount > 999) {
    throw new Error("أكمل مخزون العيّنة.");
  }
  return { priceSar, stockCount, isEnabled };
}

function readWearLevel(value: FormDataEntryValue | null): WearLevel {
  const level = Number(value);
  const match = wearLevels.find((entry) => entry === level);
  if (!match) throw new Error("اختر درجة الثبات والانتشار.");
  return match;
}

async function storeGallery(formData: FormData, productId: string): Promise<ProductImages> {
  return {
    bottle: await storeImage(formData.get("bottleImage"), productId, "bottle"),
    liquid: await storeImage(formData.get("liquidImage"), productId, "liquid"),
    texture: await storeImage(formData.get("textureImage"), productId, "texture"),
    pyramid: await storeImage(formData.get("pyramidImage"), productId, "pyramid"),
  };
}

function assertImage(value: FormDataEntryValue | null): void {
  if (!(value instanceof File) || value.size === 0) return;
  if (!allowedTypes.has(value.type)) throw new Error("الصورة يجب أن تكون JPG أو PNG أو WebP.");
  if (value.size > maxImageBytes) throw new Error("الصورة أكبر من 4 ميغابايت.");
}

async function storeImage(
  value: FormDataEntryValue | null,
  productId: string,
  kind: ProductImageKind,
): Promise<string | null> {
  if (!(value instanceof File) || value.size === 0) return null;
  const extension = allowedTypes.get(value.type);
  if (!extension) throw new Error("الصورة يجب أن تكون JPG أو PNG أو WebP.");
  if (value.size > maxImageBytes) throw new Error("الصورة أكبر من 4 ميغابايت.");
  const directory = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(directory, { recursive: true });
  await Promise.all(
    ["jpg", "png", "webp"].map((candidate) => {
      return fs.unlink(path.join(directory, `${productId}-${kind}.${candidate}`)).catch(() => undefined);
    }),
  );
  const fileName = `${productId}-${kind}.${extension}`;
  await fs.writeFile(path.join(directory, fileName), Buffer.from(await value.arrayBuffer()));
  return `/uploads/products/${fileName}`;
}

function isFamily(value: string): value is FragranceFamily {
  return fragranceFamilies.some((family) => family === value);
}
