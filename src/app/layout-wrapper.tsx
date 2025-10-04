
import "./globals.css";
import RootLayout from "./layout";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
