import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Station Desk",
  description: "Office-style kanban strategy about defending a space station from alien boarding teams.",
};

const themeSetupScript = `
  (function () {
    try {
      var savedTheme = localStorage.getItem("station-desk-theme");
      var useDarkTheme = savedTheme === "dark";

      if (!savedTheme) {
        useDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      if (useDarkTheme) {
        document.documentElement.classList.add("dark");
      }
    } catch (error) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeSetupScript }} /></head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
