export const corsOptions = {
  origin: ["*"] as string[],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
};

if (process.env.NODE_ENV === "production") {
  // Filter out empty/undefined origins
  const productionOrigins = [
    process.env.ORIGIN,
    "http://localhost:3000",
    "http://localhost:5000",
    "lanci://",
  ].filter((origin): origin is string => !!origin && origin.length > 0);

  corsOptions.origin = productionOrigins;
} else {
  corsOptions.origin = [
    "http://192.168.1.18:3000",
    "http://192.168.1.17:3000",
    "http://192.168.1.16:3000",
    "http://192.168.1.18:3001",
    "http://192.168.1.17:3001",
    "http://192.168.1.16:3001",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "exp://",
  ];
}
