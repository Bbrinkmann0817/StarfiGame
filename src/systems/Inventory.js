/**
 * Player inventory & wallet: Jira-Münzen, Kaffeetassen and purchased upgrades.
 */
export class Inventory {
  constructor() {
    this.coins = 0;
    this.coffees = 0;
    this.upgrades = new Set();
    this.onChange = null; // () => void
  }

  addCoins(n) {
    this.coins += n;
    this.onChange?.();
  }
  spendCoins(n) {
    if (this.coins < n) return false;
    this.coins -= n;
    this.onChange?.();
    return true;
  }

  addCoffee(n = 1) {
    this.coffees += n;
    this.onChange?.();
  }
  hasCoffee() {
    return this.coffees > 0;
  }
  useCoffee() {
    if (this.coffees <= 0) return false;
    this.coffees--;
    this.onChange?.();
    return true;
  }

  ownsUpgrade(id) {
    return this.upgrades.has(id);
  }
  addUpgrade(id) {
    this.upgrades.add(id);
    this.onChange?.();
  }
}
