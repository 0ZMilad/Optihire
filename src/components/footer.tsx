import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-b from-background/50 to-background backdrop-blur-sm relative pt-4 sm:pt-5 lg:pt-6">
      {/* Main glowing line - shortened */}
      <div className="absolute top-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      {/* Glow effect */}
      <div className="absolute top-0 left-[15%] right-[15%] h-[1px]">
        <div className="h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-[2px]"></div>
      </div>
      {/* Extra glow */}
      <div className="absolute top-[-2px] left-[25%] right-[25%] h-[4px] bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md"></div>

      <div className="w-full py-3 sm:py-4">
        <div
          className="mx-auto"
          style={{ paddingLeft: "15%", paddingRight: "15%" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center space-x-2 group">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">
                  O
                </span>
              </div>
              <span className="text-base sm:text-lg font-bold text-foreground">
                OptiHire
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors duration-200"
              >
                Contact
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} OptiHire. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
