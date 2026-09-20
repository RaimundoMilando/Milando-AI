const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsFolder);
  },

  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname) || ".mp4";
    const filename = "video-" + Date.now() + extension;

    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("O ficheiro precisa ser um vídeo."));
    }
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.use(
  "/uploads",
  express.static(uploadsFolder)
);

app.get("/", function (req, res) {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});

app.post(
  "/api/process-video",
  upload.single("video"),
  function (req, res) {

    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nenhum vídeo foi enviado."
        });
      }

      const type = req.body.type || "";
      const projectName = req.body.projectName || "";
      const videoText = req.body.videoText || "";

      const videoUrl =
        "/uploads/" + req.file.filename;

      console.log("Novo projeto:");
      console.log("Tipo:", type);
      console.log("Nome:", projectName);
      console.log("Texto:", videoText);
      console.log("Vídeo:", req.file.filename);

      return res.json({
        success: true,
        message: "Vídeo recebido com sucesso.",
        projectName: projectName,
        type: type,
        videoText: videoText,
        videoUrl: videoUrl
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Erro interno no servidor."
      });
    }
  }
);

app.use(function (error, req, res, next) {

  console.error(error);

  return res.status(500).json({
    success: false,
    message: error.message || "Erro no servidor."
  });

});

app.listen(PORT, function () {

  console.log("================================");
  console.log("🤖 Milando AI iniciado!");
  console.log("Porta:", PORT);
  console.log("================================");

});
