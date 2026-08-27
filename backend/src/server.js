require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectRedis } = require("./redis");
const errorHandler = require("./middleware/errorHandler");

const samplesRouter = require("./routes/samples");
const resultsRouter = require("./routes/results");
const reportsRouter = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/samples", samplesRouter);
app.use("/api/results", resultsRouter);
app.use("/api/reports", reportsRouter);

app.use(errorHandler);

async function start() {
  await connectRedis();
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
