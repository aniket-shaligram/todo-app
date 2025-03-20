const config = {
  API_URL: process.env.REACT_APP_API_URL,
  AUTH_TOKEN_KEY: process.env.REACT_APP_AUTH_TOKEN_KEY,
  SUBSCRIPTION_TIERS: {
    FREE: 'FREE',
    BASIC: 'BASIC',
    PREMIUM: 'PREMIUM',
    ENTERPRISE: 'ENTERPRISE'
  }
};

export default config;
