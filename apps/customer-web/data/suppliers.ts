import type { SupplierStorefront } from "../shared/types";

export const suppliers: SupplierStorefront[] = [
  {
    id: "sup-neema",
    slug: "neema-fresh-market",
    name: "Neema Fresh Market",
    area: "namilyango",
    tagline: "Leafy greens, tomatoes, onions, and daily essentials from the hill.",
    etaMinutes: 28,
    verified: true,
    rating: 4.8,
    categories: ["Vegetables", "Fruit", "Staples"],
    hero: "/marketplace/neema-fresh.webp",
    accent: "#1D6F3B",
    minBasketUgx: 12000,
    distanceKm: 1.8,
    open: true,
    pickupPartner: "Kato Boda",
    story:
      "Neema keeps the basket simple: quick produce, small pantry restocks, and daily rider dispatch from Namilyango.",
    prepWindow: "15-25 min",
    badges: ["Verified", "Fast rider coordination", "Best for family top-ups"],
    products: [
      {
        id: "prd-tomatoes",
        supplierId: "sup-neema",
        category: "Vegetables",
        name: "Tomatoes",
        description: "Bright red market tomatoes packed for quick sauces and stews.",
        unitLabel: "1 kg",
        priceUgx: 4500,
        image: "/products/tomatoes.webp",
        popular: true
      },
      {
        id: "prd-onions",
        supplierId: "sup-neema",
        category: "Vegetables",
        name: "Onions",
        description: "Cooking onions selected for a week's worth of home meals.",
        unitLabel: "1 kg",
        priceUgx: 3200,
        image: "/products/onions.webp"
      },
      {
        id: "prd-spinach",
        supplierId: "sup-neema",
        category: "Vegetables",
        name: "Spinach bunch",
        description: "Fresh bunches tied for same-day cooking.",
        unitLabel: "2 bunches",
        priceUgx: 2500,
        image: "/products/spinach.webp"
      },
      {
        id: "prd-bananas",
        supplierId: "sup-neema",
        category: "Fruit",
        name: "Sweet bananas",
        description: "Ripe home-snack bananas for breakfast and tea time.",
        unitLabel: "1 dozen",
        priceUgx: 6000,
        image: "/products/bananas.webp"
      },
      {
        id: "prd-rice",
        supplierId: "sup-neema",
        category: "Staples",
        name: "Rice",
        description: "Clean white rice for home pantry refills.",
        unitLabel: "2 kg",
        priceUgx: 9800,
        image: "/products/rice.webp",
        popular: true
      }
    ]
  },
  {
    id: "sup-kibuuka",
    slug: "kibuuka-butchery-staples",
    name: "Kibuuka Butchery & Staples",
    area: "gwafu",
    tagline: "Butchery cuts, dry goods, and fast lunch baskets from Gwafu.",
    etaMinutes: 35,
    verified: true,
    rating: 4.7,
    categories: ["Butchery", "Staples", "Sauces"],
    hero: "/marketplace/kibuuka-butchery.webp",
    accent: "#A2471A",
    minBasketUgx: 15000,
    distanceKm: 2.7,
    open: true,
    pickupPartner: "Ssebaggala Rider",
    story:
      "Kibuuka handles heavier household baskets with dependable packaging for meat, flour, and sauce staples.",
    prepWindow: "20-35 min",
    badges: ["Verified", "Trusted by lunch shoppers", "Best for larger baskets"],
    products: [
      {
        id: "prd-beef",
        supplierId: "sup-kibuuka",
        category: "Butchery",
        name: "Beef",
        description: "Fresh trimmed beef for stew and roasting.",
        unitLabel: "1 kg",
        priceUgx: 18000,
        image: "/products/beef.webp",
        popular: true
      },
      {
        id: "prd-chicken",
        supplierId: "sup-kibuuka",
        category: "Butchery",
        name: "Broiler chicken",
        description: "Whole dressed chicken prepared for home cooking.",
        unitLabel: "1 bird",
        priceUgx: 26000,
        image: "/products/chicken.webp"
      },
      {
        id: "prd-posho",
        supplierId: "sup-kibuuka",
        category: "Staples",
        name: "Posho flour",
        description: "Milled maize flour packed for family servings.",
        unitLabel: "2 kg",
        priceUgx: 5200,
        image: "/products/posho.webp"
      },
      {
        id: "prd-groundnut",
        supplierId: "sup-kibuuka",
        category: "Sauces",
        name: "Groundnut paste",
        description: "Creamy paste for quick home sauce prep.",
        unitLabel: "500 g",
        priceUgx: 9000,
        image: "/products/groundnut.webp"
      },
      {
        id: "prd-beans",
        supplierId: "sup-kibuuka",
        category: "Staples",
        name: "Beans",
        description: "Dry beans sorted for stewing and batch cooking.",
        unitLabel: "2 kg",
        priceUgx: 8600,
        image: "/products/beans.webp",
        popular: true
      }
    ]
  },
  {
    id: "sup-sunrise",
    slug: "sunrise-greens-pantry",
    name: "Sunrise Greens Pantry",
    area: "njerere",
    tagline: "A tidy mix of fruit, greens, and pantry restocks for eastern homes.",
    etaMinutes: 30,
    verified: true,
    rating: 4.9,
    categories: ["Vegetables", "Fruit", "Pantry"],
    hero: "/marketplace/sunrise-greens.webp",
    accent: "#2F9E44",
    minBasketUgx: 10000,
    distanceKm: 3.4,
    open: true,
    pickupPartner: "Mayanja Express",
    story:
      "Sunrise is ideal for colorful produce runs and smaller family baskets headed deeper into Njerere.",
    prepWindow: "18-28 min",
    badges: ["Verified", "Strong produce quality", "Best for weekly restocks"],
    products: [
      {
        id: "prd-cabbage",
        supplierId: "sup-sunrise",
        category: "Vegetables",
        name: "Cabbage",
        description: "Crunchy heads selected for salads and quick fry-ups.",
        unitLabel: "1 head",
        priceUgx: 3500,
        image: "/products/cabbage.webp",
        popular: true
      },
      {
        id: "prd-carrots",
        supplierId: "sup-sunrise",
        category: "Vegetables",
        name: "Carrots",
        description: "Bright carrots for soup, rice, and lunchboxes.",
        unitLabel: "1 kg",
        priceUgx: 4200,
        image: "/products/carrots.webp"
      },
      {
        id: "prd-pineapple",
        supplierId: "sup-sunrise",
        category: "Fruit",
        name: "Pineapple",
        description: "Sweet whole pineapple ready for slicing.",
        unitLabel: "1 fruit",
        priceUgx: 7000,
        image: "/products/pineapple.webp"
      },
      {
        id: "prd-cooking-oil",
        supplierId: "sup-sunrise",
        category: "Pantry",
        name: "Cooking oil",
        description: "Clear vegetable oil for pantry refills.",
        unitLabel: "1 litre",
        priceUgx: 8500,
        image: "/products/cooking-oil.webp",
        popular: true
      },
      {
        id: "prd-salt",
        supplierId: "sup-sunrise",
        category: "Pantry",
        name: "Salt",
        description: "Family table salt for daily cooking.",
        unitLabel: "500 g",
        priceUgx: 1500,
        image: "/products/salt.webp"
      }
    ]
  }
];

export const suppliersBySlug = new Map(suppliers.map((supplier) => [supplier.slug, supplier]));
