Page({
  data: {
    catalogueUrl: "https://www.meimifurniture.com/app/",
  },

  onLoad() {
    const app = getApp();
    this.setData({ catalogueUrl: app.globalData.catalogueUrl });
  },

  onMessage() {
    // Reserved for future native mini program actions from the catalogue.
  },
});
