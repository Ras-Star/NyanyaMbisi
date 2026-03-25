import type { LaunchZoneId } from "../shared/types";

export interface HomeQuickPick {
  id: string;
  titleKey: string;
  bodyKey: string;
  image: string;
  searchTerm: string;
  zoneId?: LaunchZoneId | "all";
}

export interface HomeJourneyStep {
  id: string;
  number: string;
  titleKey: string;
  bodyKey: string;
}

export const homeQuickPicks: HomeQuickPick[] = [
  {
    id: "produce",
    titleKey: "home.quickPicks.produce.title",
    bodyKey: "home.quickPicks.produce.body",
    image: "/marketplace/neema-fresh.webp",
    searchTerm: "Vegetables",
    zoneId: "namilyango"
  },
  {
    id: "butchery",
    titleKey: "home.quickPicks.butchery.title",
    bodyKey: "home.quickPicks.butchery.body",
    image: "/marketplace/kibuuka-butchery.webp",
    searchTerm: "Butchery",
    zoneId: "gwafu"
  },
  {
    id: "fruit",
    titleKey: "home.quickPicks.fruit.title",
    bodyKey: "home.quickPicks.fruit.body",
    image: "/marketplace/sunrise-greens.webp",
    searchTerm: "Fruit",
    zoneId: "njerere"
  },
  {
    id: "pantry",
    titleKey: "home.quickPicks.pantry.title",
    bodyKey: "home.quickPicks.pantry.body",
    image: "/marketplace/home-hero.webp",
    searchTerm: "Staples",
    zoneId: "all"
  }
];

export const homeJourneySteps: HomeJourneyStep[] = [
  {
    id: "pick-store",
    number: "01",
    titleKey: "home.flow.pickStore.title",
    bodyKey: "home.flow.pickStore.body"
  },
  {
    id: "confirm-pin",
    number: "02",
    titleKey: "home.flow.confirmPin.title",
    bodyKey: "home.flow.confirmPin.body"
  },
  {
    id: "pay-mobile-money",
    number: "03",
    titleKey: "home.flow.payMobileMoney.title",
    bodyKey: "home.flow.payMobileMoney.body"
  }
];
