<template>
  <div class="page-shell">
    <BrandHeader />
    <NotificationPanel />
    <main class="page-main">
      <slot />
    </main>
    <CartDock />
  </div>
</template>
