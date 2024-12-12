export default function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="w-full md:w-2/5 mx-auto">{children}</section>;
}
