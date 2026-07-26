import { EmbeddedDashboard } from "@/components/dashboard/embedded-dashboard";

export const dynamic = "force-dynamic";

export default function ProductLabPage() {
  const productlabUrl = process.env.NEXT_PUBLIC_PRODUCT_LAB_URL || "https://productlab.pxiaoer.blog/";

  return <EmbeddedDashboard src={productlabUrl} title="Product Lab 产品验证" />;
}
