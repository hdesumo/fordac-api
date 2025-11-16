const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const uploadRoutes = require("./routes/uploadRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

// 🧭 Routes
app.use("/", uploadRoutes);

// 📂 Servir les fichiers statiques (pour visualisation directe)
app.use("/files", express.static(path.resolve("upload-service/uploads")));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log("📤 FORDAC Upload Service running");
  console.log(`✅ Port: ${PORT}`);
});
