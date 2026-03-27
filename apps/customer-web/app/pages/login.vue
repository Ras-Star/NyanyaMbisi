<script setup lang="ts">
import { storeToRefs } from "pinia";
import { getUgandanMobileProvider } from "~~/shared/phone";
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const authStore = useAuthStore();
const { isAuthenticated, ready } = storeToRefs(authStore);
const { initialize, signInWithPhone, verifyPhoneOtp } = useCustomerAuth();
const { t } = useI18n();

useHead({
  title: "Login"
});

const phone = ref(authStore.customerPhone);
const otpCode = ref("");
const otpSentTo = ref("");
const otpSessionId = ref("");
const otpDevCode = ref("");
const otpDeliveryMode = ref<"sms" | "fallback" | "">("");
const sending = ref(false);
const verifying = ref(false);
const errorMessage = ref("");
const statusMessage = ref("");
const detectedProvider = computed(() => getUgandanMobileProvider(otpSentTo.value || phone.value));

const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/";
});

const redirectLabel = computed(() => {
  if (redirectPath.value.startsWith("/checkout/payment")) return t("payment.title");
  if (redirectPath.value.startsWith("/checkout")) return t("nav.checkout");
  if (redirectPath.value.startsWith("/cart")) return t("nav.cart");
  if (redirectPath.value.startsWith("/orders")) return t("nav.orders");
  return t("nav.marketplace");
});

watch(
  isAuthenticated,
  async (value) => {
    if (value) {
      await navigateTo(redirectPath.value);
    }
  },
  { immediate: true }
);

onMounted(() => {
  void initialize();
});

async function requestOtp() {
  errorMessage.value = "";
  statusMessage.value = "";
  otpSessionId.value = "";
  otpDevCode.value = "";
  otpDeliveryMode.value = "";
  sending.value = true;

  try {
    const result = await signInWithPhone(phone.value);
    otpSentTo.value = result.phone;
    otpSessionId.value = result.sessionId ?? "";
    otpDevCode.value = result.devCode ?? "";
    otpDeliveryMode.value = result.channel;
    statusMessage.value =
      result.channel === "sms"
        ? t("login.codeSent", { phone: result.phone })
        : t("login.codeSentFallback", { phone: result.phone });
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    sending.value = false;
  }
}

async function submitOtp() {
  errorMessage.value = "";
  statusMessage.value = "";
  verifying.value = true;

  try {
    await verifyPhoneOtp({
      phone: otpSentTo.value || phone.value,
      otpCode: otpCode.value,
      sessionId: otpSessionId.value || undefined
    });
    statusMessage.value = t("login.success");
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    verifying.value = false;
  }
}
</script>

<template>
  <div class="grid login-page">
    <section class="section-header">
      <span class="eyebrow">{{ t("nav.signIn") }}</span>
      <h1 class="title-lg">{{ t("login.title") }}</h1>
      <p class="muted">{{ t("login.subtitle") }}</p>
      <p class="muted">{{ t("login.redirectHint", { destination: redirectLabel }) }}</p>
    </section>

    <section class="surface-card login-page__panel">
      <div v-if="!ready" class="status-note">
        <strong>{{ t("common.loading") }}</strong>
      </div>

      <div class="grid login-page__form">
        <div class="pill-row">
          <span class="pill is-active">{{ t("payment.mtn") }}</span>
          <span class="pill is-active">{{ t("payment.airtel") }}</span>
        </div>

        <label class="field-stack">
          <span class="field-label">{{ t("checkout.phone") }}</span>
          <input v-model="phone" class="field-input" type="tel" placeholder="+256 700 123 456 or 0700 123456" />
        </label>

        <div v-if="detectedProvider" class="status-note">
          <strong>{{ detectedProvider === "mtn" ? t("payment.mtn") : t("payment.airtel") }}</strong>
          <span>{{ t("login.providerDetected") }}</span>
        </div>

        <button type="button" class="btn btn--primary" :disabled="sending" @click="requestOtp">
          {{ t("login.sendCode") }}
        </button>

        <label class="field-stack">
          <span class="field-label">{{ t("checkout.code") }}</span>
          <input v-model="otpCode" class="field-input" type="text" inputmode="numeric" />
        </label>

        <button type="button" class="btn btn--sun" :disabled="verifying || !otpCode.trim()" @click="submitOtp">
          {{ t("login.verifyCode") }}
        </button>
      </div>

      <div v-if="statusMessage" class="status-note is-success">
        <strong>{{ statusMessage }}</strong>
      </div>

      <div v-if="otpDeliveryMode === 'fallback' && otpDevCode" class="status-note">
        <strong>{{ t("login.fallbackTitle") }}</strong>
        <span>{{ t("login.fallbackBody") }}</span>
        <code class="login-page__code">{{ otpDevCode }}</code>
      </div>

      <div v-if="errorMessage" class="status-note is-danger">
        <strong>{{ errorMessage }}</strong>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  gap: 1rem;
}

.login-page__panel {
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
}

.login-page__form {
  gap: 0.9rem;
}

.login-page__code {
  display: inline-flex;
  width: fit-content;
  padding: 0.45rem 0.7rem;
  border-radius: 12px;
  background: rgba(14, 32, 21, 0.08);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
</style>
