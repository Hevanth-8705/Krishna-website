// HomePage.js - Page Object Model for the Home page
class HomePage {
  // Define selectors
  get banner() { return $('header .banner'); }
  get navLinks() { return $$('nav a'); }

  async open() {
    await browser.url('/');
  }

  async isBannerVisible() {
    return await this.banner.isDisplayed();
  }

  async clickNavLink(text) {
    const link = await $('nav a=' + text);
    await link.click();
  }
}
module.exports = new HomePage();
