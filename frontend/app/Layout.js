export const metadata = {
  title: "Web 3 Miner",
  description: "GG72 mining frontend"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#050816",
          color: "#f9fafb"
        }}
      >
        {children}
      </body>
    </html>
  );
}
