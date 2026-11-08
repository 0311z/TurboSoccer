// WHY: Sin DSN no se importa el SDK ni la telemetría en la navegación inicial.
if(process.env.NEXT_PUBLIC_SENTRY_DSN){void import('@/lib/telemetry/client').then(module=>module.initializeTelemetry());}
