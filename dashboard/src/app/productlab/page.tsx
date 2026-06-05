export const dynamic = "force-dynamic";

export default function ProductLabPage() {
  const productlabUrl = process.env.NEXT_PUBLIC_PRODUCT_LAB_URL || "https://productlab.pxiaoer.blog/";

  return (
    <main className="flex-1 w-full h-[calc(100vh-64px)] bg-[#faf7f2] overflow-hidden">
      <iframe
        src={productlabUrl}
        className="w-full h-full border-0 m-0 p-0 block"
        title="Product Lab"
        allow="clipboard-write"
      />
    </main>
  );
}
