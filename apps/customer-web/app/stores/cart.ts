import { defineStore } from "pinia";
import type { CartLine, Product, SupplierStorefront } from "~~/shared/types";

interface CartSupplierSummary {
  id: string;
  slug: string;
  name: string;
  area: SupplierStorefront["area"];
  minBasketUgx: number;
  hero: string;
  tagline: string;
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    supplier: null as CartSupplierSummary | null,
    items: [] as CartLine[]
  }),
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalUgx: (state) => state.items.reduce((sum, item) => sum + item.priceUgx * item.quantity, 0)
  },
  actions: {
    hydrate(payload: { supplier: CartSupplierSummary | null; items: CartLine[] }) {
      this.supplier = payload.supplier;
      this.items = payload.items;
    },
    addProduct(supplier: SupplierStorefront, product: Product) {
      if (!this.supplier || this.supplier.id !== supplier.id) {
        this.supplier = {
          id: supplier.id,
          slug: supplier.slug,
          name: supplier.name,
          area: supplier.area,
          minBasketUgx: supplier.minBasketUgx,
          hero: supplier.hero,
          tagline: supplier.tagline
        };
        this.items = [];
      }

      const existingLine = this.items.find((item) => item.productId === product.id);

      if (existingLine) {
        existingLine.quantity += 1;
        return;
      }

      this.items.push({
        productId: product.id,
        supplierId: supplier.id,
        name: product.name,
        unitLabel: product.unitLabel,
        priceUgx: product.priceUgx,
        quantity: 1,
        image: product.image
      });
    },
    setQuantity(productId: string, quantity: number) {
      if (quantity <= 0) {
        this.removeItem(productId);
        return;
      }

      const line = this.items.find((item) => item.productId === productId);

      if (line) {
        line.quantity = quantity;
      }
    },
    removeItem(productId: string) {
      this.items = this.items.filter((item) => item.productId !== productId);

      if (!this.items.length) {
        this.supplier = null;
      }
    },
    clearCart() {
      this.supplier = null;
      this.items = [];
    }
  }
});

