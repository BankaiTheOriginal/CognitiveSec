export default () => ({
  jwt_secret: process.env.JWT_SECRET,
  openRouter_api_key: process.env.OPENROUTER_API_KEY,
  r2: {
    account_id: process.env.R2_ACCOUNT_ID,
    access_key: process.env.R2_ACCESS_KEY_ID,
    secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
  },
});
