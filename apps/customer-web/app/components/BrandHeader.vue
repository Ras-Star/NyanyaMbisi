<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";

const cartStore = useCartStore();
const authStore = useAuthStore();
const route = useRoute();
const { itemCount } = storeToRefs(cartStore);
const { isAuthenticated, unreadNotificationCount, customerName } = storeToRefs(authStore);
const { t } = useI18n();

const warmGreeting = computed(() =>
  customerName.value ? t("account.warmGreetingNamed", { name: customerName.value }) : t("account.warmGreeting")
);

function openNotifications() {
  authStore.setActivityOpen(true);
}
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <NuxtLink class="header__brand" to="/">
        <span class="header__logo">
          <span class="header__logo-core"></span>
        </span>
        <span class="header__copy">
          <strong>Nyanya Mbisi</strong>
          <span>{{ t("brandTagline") }}</span>
        </span>
      </NuxtLink>

      <div class="header__actions">
        <LanguageToggle />
        <button
          v-if="isAuthenticated"
          type="button"
          class="header__icon-button"
          :aria-label="t('notifications.title')"
          @click="openNotifications"
        >
          <span>{{ t("nav.notifications") }}</span>
          <strong v-if="unreadNotificationCount">{{ unreadNotificationCount }}</strong>
        </button>
        <NuxtLink v-if="isAuthenticated" class="header__account" to="/orders">
          <span>{{ warmGreeting }}</span>
          <strong>{{ t("nav.orders") }}</strong>
        </NuxtLink>
        <NuxtLink v-if="isAuthenticated" class="header__cart" to="/cart">
          <span>{{ t("nav.cart") }}</span>
          <strong>{{ itemCount }}</strong>
        </NuxtLink>
        <NuxtLink
          v-else-if="!route.path.startsWith('/login')"
          class="btn btn--primary header__login"
          :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`"
        >
          {{ t("nav.signIn") }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(14px);
  background: linear-gradient(180deg, rgba(245, 248, 232, 0.96), rgba(245, 248, 232, 0.74));
}

.header__inner {
  width: min(calc(100% - 1.25rem), var(--max-width));
  margin: 0 auto;
  padding: 0.8rem 0 0.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  transition: transform 180ms ease;
}

.header__brand:hover {
  transform: translateY(-1px);
}

.header__logo {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.78), transparent 42%),
    linear-gradient(135deg, var(--brand-sun), #ffd54d 45%, var(--brand-leaf) 46%, #2f8f4f 100%);
  box-shadow: var(--shadow-sm);
}

.header__logo-core {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 70% 30% 70% 30%;
  background: rgba(255, 255, 255, 0.94);
  transform: rotate(-24deg);
}

.header__copy {
  display: grid;
  gap: 0.12rem;
}

.header__copy strong {
  font-family: "Fraunces", Georgia, serif;
  font-size: 1.08rem;
}

.header__copy span {
  color: var(--ink-muted);
  font-size: 0.8rem;
  line-height: 1.15;
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.header__icon-button,
.header__account {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.38rem 0.75rem;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-sm);
  font-weight: 800;
}

.header__icon-button strong {
  min-width: 1.55rem;
  min-height: 1.55rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand-sun), #ffd75d);
}

.header__account {
  display: grid;
  gap: 0.08rem;
  align-items: start;
}

.header__account span {
  font-size: 0.8rem;
  color: var(--ink-muted);
}

.header__account strong {
  font-size: 0.9rem;
}

.header__cart {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.32rem 0.4rem 0.32rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-sm);
  font-weight: 800;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.header__cart:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(20, 67, 36, 0.14);
}

.header__cart strong {
  min-width: 1.9rem;
  min-height: 1.9rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand-sun), #ffd75d);
}

.header__login {
  min-height: auto;
  padding: 0.8rem 1rem;
}

@media (max-width: 620px) {
  .header__inner {
    align-items: flex-start;
  }

  .header__actions {
    gap: 0.4rem;
  }

  .header__cart {
    padding-left: 0.7rem;
  }

  .header__copy span {
    display: none;
  }

  .header__account span {
    display: none;
  }
}
</style>
