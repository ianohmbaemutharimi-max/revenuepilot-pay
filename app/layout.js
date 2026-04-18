export const metadata = {
  title: "Fintech App",
  description: "Supabase + Vercel system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
