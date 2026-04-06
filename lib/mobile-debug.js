// Enhanced mobile debugging for checkout
const DEBUG_MOBILE = true;

if (DEBUG_MOBILE && typeof window !== 'undefined') {
  // Mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  console.log('🔍 MOBILE DEBUG:', {
    isMobile,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    screen: `${screen.width}x${screen.height}`,
    devicePixelRatio: window.devicePixelRatio,
  });

  // Monitor all unhandled errors
  window.addEventListener('error', (event) => {
    console.error('🔍 MOBILE ERROR:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: new Date().toISOString(),
      isMobile,
    });
  });

  // Monitor unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔍 MOBILE UNHANDLED REJECTION:', {
      reason: event.reason,
      timestamp: new Date().toISOString(),
      isMobile,
    });
  });
}