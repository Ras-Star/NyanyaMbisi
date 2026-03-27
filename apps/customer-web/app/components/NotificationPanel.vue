<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const { notifications, activityOpen, isAuthenticated } = storeToRefs(authStore);
const { refreshNotifications, markNotificationRead } = useCustomerAuth();
const { t } = useI18n();

const dateFormatter = new Intl.DateTimeFormat("en-UG", {
  dateStyle: "medium",
  timeStyle: "short"
});

watch(
  activityOpen,
  (open) => {
    if (open && isAuthenticated.value) {
      void refreshNotifications();
    }
  },
  { immediate: false }
);

async function openOrder(notificationId: string, orderId: string, readAt: string | null) {
  if (!readAt) {
    await markNotificationRead(notificationId);
  }

  authStore.setActivityOpen(false);
  await navigateTo(`/orders/${orderId}`);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="activity-fade">
      <div v-if="activityOpen" class="activity-shell">
        <button type="button" class="activity-shell__backdrop" @click="authStore.setActivityOpen(false)"></button>
        <aside class="activity-sheet surface-card" aria-label="Notifications">
          <div class="activity-sheet__header">
            <div>
              <span class="eyebrow">{{ t("notifications.eyebrow") }}</span>
              <h2 class="title-md">{{ t("notifications.title") }}</h2>
            </div>
            <button type="button" class="activity-sheet__close" @click="authStore.setActivityOpen(false)">
              {{ t("common.close") }}
            </button>
          </div>

          <section v-if="notifications.length" class="activity-sheet__list">
            <button
              v-for="notification in notifications"
              :key="notification.id"
              type="button"
              class="activity-item surface-panel"
              :class="{ 'is-unread': !notification.readAt }"
              @click="openOrder(notification.id, notification.orderId, notification.readAt)"
            >
              <div class="activity-item__copy">
                <strong>{{ notification.title }}</strong>
                <p class="muted">{{ notification.body }}</p>
              </div>
              <div class="activity-item__meta">
                <StatusChip :label="notification.readAt ? t('notifications.read') : t('notifications.unread')" :tone="notification.readAt ? 'leaf' : 'sun'" />
                <span class="muted">{{ dateFormatter.format(new Date(notification.createdAt)) }}</span>
              </div>
            </button>
          </section>

          <section v-else class="empty-state activity-sheet__empty">
            <h3 class="title-md">{{ t("notifications.emptyTitle") }}</h3>
            <p class="muted">{{ t("notifications.emptyBody") }}</p>
          </section>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.activity-shell {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  justify-items: end;
}

.activity-shell__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(14, 32, 21, 0.32);
}

.activity-sheet {
  position: relative;
  width: min(92vw, 420px);
  min-height: 100vh;
  padding: 1.1rem;
  border-radius: 0;
  display: grid;
  align-content: start;
  gap: 1rem;
  overflow-y: auto;
}

.activity-sheet__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.activity-sheet__close {
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 0.95rem;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: var(--shadow-sm);
  font-weight: 800;
}

.activity-sheet__list {
  display: grid;
  gap: 0.85rem;
}

.activity-item {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  text-align: left;
  border: 0;
}

.activity-item.is-unread {
  background: linear-gradient(180deg, rgba(255, 244, 201, 0.96), rgba(255, 253, 246, 0.94));
}

.activity-item__copy {
  display: grid;
  gap: 0.35rem;
}

.activity-item__copy p {
  margin: 0;
  line-height: 1.55;
}

.activity-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.activity-sheet__empty {
  justify-items: start;
  text-align: left;
}

.activity-fade-enter-active,
.activity-fade-leave-active {
  transition: opacity 180ms ease;
}

.activity-fade-enter-active .activity-sheet,
.activity-fade-leave-active .activity-sheet {
  transition: transform 220ms ease;
}

.activity-fade-enter-from,
.activity-fade-leave-to {
  opacity: 0;
}

.activity-fade-enter-from .activity-sheet,
.activity-fade-leave-to .activity-sheet {
  transform: translateX(16px);
}
</style>
