require("dotenv").config();
const fireBaseAdminSdkJson = {
  type: process.env.FIREBASE_ADMIN_ACC_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJ_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRVT_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRVT_KEY,
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN,
};

module.exports = fireBaseAdminSdkJson;
