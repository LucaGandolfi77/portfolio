<!-- Google Analytics 4 Configuration
     Replace GOOGLE_ANALYTICS_ID with your actual GA4 measurement ID
     Get it from: https://analytics.google.com -->

<!-- Add this to <head> section of index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GOOGLE_ANALYTICS_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GOOGLE_ANALYTICS_ID', {
    'page_path': window.location.pathname,
    'anonymize_ip': true
  });
</script>

<!-- Google Search Console Verification
     Replace VERIFICATION_CODE with your actual verification code
     Get it from: https://search.google.com/search-console -->
<!-- <meta name="google-site-verification" content="VERIFICATION_CODE"> -->

<!-- Bing Webmaster Tools Verification
     Replace VERIFICATION_CODE with your actual verification code
     Get it from: https://www.bing.com/webmaster/home -->
<!-- <meta name="msvalidate.01" content="VERIFICATION_CODE"> -->
