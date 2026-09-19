const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

// =====================================
// PASTAS
// =====================================

const uploadsFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

// =====================================
// CONFIGURAÇÃO DO MULTER
// =====================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsFolder);
  },

  filename: function (req, file, cb) {
    const extension =
      path.extname(file.originalname) || ".mp4";

    const name =
      "video-" +
      Date.now() +
      extension;

    cb(null, name);
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

// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// ARQUIVOS DO SITE
// =====================================

app.use(express.static(__dirname));

// =====================================
// PASTA DOS VÍDEOS
// =====================================

app.use(
  "/uploads",
  express.static(uploadsFolder)
);

// =====================================
// ROTA PRINCIPAL
// =====================================

app.get("/", function (req, res) {

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});

// =====================================
// PROCESSAR VÍDEO
// =====================================

app.post(
  "/api/process-video",
  upload.single("video"),
  function (req, res) {

    try {

      // Verificar vídeo
      if (!req.file) {

        return res.status(400).json({
          success: false,
          message: "Nenhum vídeo foi enviado."
        });

      }

      // Dados enviados pelo index.html
      const type =
        req.body.type || "";

      const projectName =
        req.body.projectName || "";

      const videoText =
        req.body.videoText || "";

      // Caminho do vídeo
      const videoUrl =
        "/uploads/" + req.file.filename;

      console.log("================================");
      console.log("NOVO PROJETO");
      console.log("Tipo:", type);
      console.log("Projeto:", projectName);
      console.log("Texto:", videoText);
      console.log("Vídeo:", req.file.filename);
      console.log("================================");

      // Resposta JSON
      return res.json({

        success: true,

        message:
          "Vídeo recebido com sucesso.",

        projectName: projectName,

        type: type,

        videoText: videoText,

        videoUrl: videoUrl

      });

    } catch (error) {

      console.error(
        "Erro:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Erro interno ao processar o vídeo."

      });

    }

  }
);

// =====================================
// TRATAMENTO DE ERROS DO MULTER
// =====================================

app.use(function (err, req, res, next) {

  console.error(err);

  if (err instanceof multer.MulterError) {

    return res.status(400).json({

      success: false,

      message:
        "Erro no envio do vídeo: " +
        err.message

    });

  }

  return res.status(500).json({

    success: false,

    message:
      err.message ||
      "Erro no servidor."

  });

});

// =====================================
// INICIAR SERVIDOR
// =====================================

app.listen(PORT, function () {

  console.log(
    "================================"
  );

  console.log(
    "🤖 Milando AI iniciado!"
  );

  console.log(
    "Servidor na porta:",
    PORT
  );

  console.log(
    "================================"
  );

});
