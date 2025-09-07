
import * as React from "react"
import { useMounted } from "./use-mounted";

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  const isMounted = useMounted();

  React.useEffect(() => {
    if (!isMounted) return;
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkIsMobile(); // Initial check
    
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [isMounted])

  return isMobile
}
