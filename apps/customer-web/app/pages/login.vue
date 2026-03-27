<script setup lang="ts">
import { storeToRefs } from "pinia";
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
const sending = ref(false);
const verifying = ref(false);
const errorMessage = ref("");
const statusMessage = ref("");

const redirectPath = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/";
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
  sending.value = true;

  try {
    otpSentTo.value = await signInWithPhone(phone.value);
    statusMessage.value = t("login.codeSent", { phone: otpSentTo.value });
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
    await verifyPhoneOtp(otpSentTo.value || phone.value, otpCode.value);
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
    </section>

    <section class="surface-card login-page__panel">
      <div v-if="!ready" class="status-note">
        <strong>{{ t("common.loading") }}</strong>
      </div>

      <div class="grid login-page__form">
        <label class="field-stack">
          <span class="field-label">{{ t("checkout.phone") }}</span>
          <input v-model="phone" class="field-input" type="tel" placeholder="+256 7..." />
        </label>

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
</style>
