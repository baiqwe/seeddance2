import { permanentRedirect } from "next/navigation";

export default async function GuideRedirect(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  permanentRedirect(`/${locale}/guides`);
}
