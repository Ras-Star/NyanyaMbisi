import { useAuthStore } from "~/stores/auth";
import { useCartStore } from "~/stores/cart";
import { useCustomerStore } from "~/stores/customer";

const AUTH_KEY = "nyanya-mbisi-auth-v1";
const CART_KEY = "nyanya-mbisi-cart-v1";
const CUSTOMER_KEY = "nyanya-mbisi-customer-v2";

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  const customerStore = useCustomerStore();

  const savedAuth = localStorage.getItem(AUTH_KEY);
  const savedCart = localStorage.getItem(CART_KEY);
  const savedCustomer = localStorage.getItem(CUSTOMER_KEY);

  if (savedAuth) {
    authStore.hydrateLocalAuth(JSON.parse(savedAuth));
  }

  if (savedCart) {
    cartStore.hydrate(JSON.parse(savedCart));
  }

  if (savedCustomer) {
    customerStore.hydrate(JSON.parse(savedCustomer));
  }

  authStore.$subscribe((_, state) => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        fallbackToken: state.fallbackToken,
        fallbackPhone: state.fallbackPhone,
        fallbackFullName: state.fallbackFullName,
        notifications: state.notifications
      })
    );
  });

  cartStore.$subscribe((_, state) => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify({
        supplier: state.supplier,
        items: state.items
      })
    );
  });

  customerStore.$subscribe((_, state) => {
    localStorage.setItem(
      CUSTOMER_KEY,
      JSON.stringify({
        draft: state.draft,
        quote: state.quote,
        paymentProvider: state.paymentProvider,
        paymentSession: state.paymentSession
      })
    );
  });
});
