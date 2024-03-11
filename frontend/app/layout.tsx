import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { AccessControlContextProvider } from "./context/accessControl";
import { Toaster } from "./components/ui/toaster";
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <AccessControlContextProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <main>{children}</main>
              <Toaster />
            </ThemeProvider>
          </AccessControlContextProvider>
        </body>
      </html>
    </>
  );
}
