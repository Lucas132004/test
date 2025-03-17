export default {
  store: process.env.SHOPIFY_STORE_DOMAIN,
  themeId: process.env.SHOPIFY_THEME_ID,
  password: process.env.SHOPIFY_PASSWORD,
  directory: 'theme',
  ignore: [
    'settings_data.json' // Prevent overwriting theme settings
  ]
};