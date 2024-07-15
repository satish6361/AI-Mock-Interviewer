/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://ai-interview-mocker_owner:Wp6fbKEPc2AZ@ep-fragrant-wind-a5eoke24.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require',
    }
  };