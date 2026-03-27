const immutableAssetRules = {
  "/marketplace/**": {
    headers: {
      "cache-control": "public, max-age=604800, immutable"
    }
  },
  "/products/**": {
    headers: {
      "cache-control": "public, max-age=604800, immutable"
    }
  },
  "/illustrations/**": {
    headers: {
      "cache-control": "public, max-age=604800, immutable"
    }
  }
} satisfies Record<string, { headers: Record<string, string> }>;

const pageCacheRules =
  process.env.NODE_ENV === "production"
    ? {
        "/": { swr: 60 },
        "/supplier/**": { swr: 60 }
      }
    : {};

export default defineNuxtConfig({
  srcDir: "app/",
  ssr: true,
  devtools: { enabled: true },
  compatibilityDate: "2025-01-01",
  experimental: {
    payloadExtraction: false
  },
  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt", "@nuxtjs/i18n", "@vite-pwa/nuxt", "@nuxt/image"],
  runtimeConfig: {
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NUXT_SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SECRET_KEY ??
      process.env.NUXT_SUPABASE_SECRET_KEY ??
      "",
    supabaseOtpDevCode:
      process.env.SUPABASE_OTP_DEV_CODE ?? process.env.NUXT_SUPABASE_OTP_DEV_CODE ?? "2468",
    public: {
      appName: "Nyanya Mbisi",
      customerApiBase: "",
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
      supabaseUrl:
        process.env.NUXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.SUPABASE_URL ??
        "",
      supabaseAnonKey:
        process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        process.env.SUPABASE_PUBLISHABLE_KEY ??
        ""
    }
  },
  app: {
    head: {
      titleTemplate: "%s · Nyanya Mbisi",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { name: "theme-color", content: "#1D6F3B" },
        {
          name: "description",
          content:
            "Nyanya Mbisi is the green-and-yellow mobile marketplace for fresh groceries around Namilyango, Gwafu, and Njerere."
        }
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }]
    }
  },
  routeRules: {
    ...pageCacheRules,
    ...immutableAssetRules
  },
  image: {
    quality: 78,
    screens: {
      xs: 360,
      sm: 520,
      md: 700,
      lg: 980,
      xl: 1280
    }
  },
  i18n: {
    strategy: "no_prefix",
    defaultLocale: "en",
    langDir: "locales",
    locales: [
      { code: "en", name: "English", language: "en-UG", file: "en.ts" },
      { code: "lg", name: "Luganda", language: "lg", file: "lg.ts" }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "nyanya-mbisi-locale",
      redirectOn: "root"
    }
  },
  pwa: {
    registerType: "autoUpdate",
    includeAssets: ["favicon.svg", "icon.svg", "maskable-icon.svg"],
    manifest: {
      name: "Nyanya Mbisi",
      short_name: "Nyanya Mbisi",
      description: "Mobile marketplace for local grocery delivery around Namilyango, Gwafu, and Njerere.",
      theme_color: "#1D6F3B",
      background_color: "#F7F7E8",
      display: "standalone",
      start_url: "/",
      icons: [
        {
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "/maskable-icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "maskable"
        }
      ]
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"]
    }
  }
});
