// WHY: La validación Zod ocurre en el layout servidor; el cliente recibe solo constantes ya validadas en build.
const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL||'';
const publishableKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
export const publicEnv=Object.freeze({
 supabaseUrl,publishableKey,configured:Boolean(supabaseUrl&&publishableKey),
 siteUrl:process.env.NEXT_PUBLIC_SITE_URL||'https://turbo-soccer-values-hub.civilmarmot8.chatgpt.site',
 emailAuthEnabled:process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED==='true',
 debugLogs:process.env.NEXT_PUBLIC_DEBUG_LOGS==='true',
 sentryDsn:process.env.NEXT_PUBLIC_SENTRY_DSN||'',
 beaconToken:process.env.NEXT_PUBLIC_CF_BEACON_TOKEN||'',
 turnstileSiteKey:process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||'',
});
