import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "로봇 관절 도우미",
  description: "중학생 로봇팔 프로젝트에서 관절 설계와 코딩을 돕는 웹앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-900 antialiased selection:bg-sky-200 selection:text-sky-950">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-sky-100/70 to-transparent"
        />
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <span className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/20 blur-3xl" />
        </div>
        <div className="relative min-h-screen [&_button]:min-h-11 [&_button]:!rounded-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
