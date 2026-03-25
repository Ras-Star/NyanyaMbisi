import { useCartStore } from "~/stores/cart";
import { useCustomerStore } from "~/stores/customer";

const CART_KEY = "nyanya-mbisi-cart-v1";
const CUSTOMER_KEY = "nyanya-mbisi-customer-v1";

export default defineNuxtPlugin(() => {
  const cartStore = useCartStore();
  const customerStore = useCustomerStore();

  const savedCart = localStorage.getItem(CART_KEY);
  const savedCustomer = localStorage.getItem(CUSTOMER_KEY);

  if (savedCart) {
    cartStore.hydrate(JSON.parse(savedCart));
  }

  if (savedCustomer) {
    customerStore.hydrate(JSON.parse(savedCustomer));
  }

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
        otpSession: state.otpSession,
        verifiedToken: state.verifiedToken,
        verifiedCustomer: state.verifiedCustomer,
        quote: state.quote,
        paymentProvider: state.paymentProvider,
        paymentSession: state.paymentSession
      })
    );
  });
});

