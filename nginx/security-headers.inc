# Included by default.conf.template wherever a location sets its own add_header.
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header X-Frame-Options DENY always;
# Scripts, styles, fonts and API calls are same-origin; article images come from publisher
# CDNs over https. 'unsafe-inline' styles: Radix positions popovers with style attributes.
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
