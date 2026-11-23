import "./globals.css";

export const metadata = {
  title: "YOUR NAME — Deep Dive Portfolio",
  description: "A light, ocean-inspired web security and cloud portfolio.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
