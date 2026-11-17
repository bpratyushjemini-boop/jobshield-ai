import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "JOBSHIELD AI: Recruitment Fraud Detection System",
  description:
    "Analyze job postings for patterns associated with recruitment fraud. Review the model assessment and the evidence behind it before deciding what to do next.",
  keywords: [
    "Recruitment Fraud Detection",
    "Fake Job Detection",
    "Employment Scam Detection",
    "JOBSHIELD AI",
    "EMSCAD Benchmark",
    "Machine Learning NLP",
  ],
  authors: [{ name: "JOBSHIELD AI Team" }],
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('jobshield-theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (stored === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Initial theme for first-time visitors is Light (Swan Wing)
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
