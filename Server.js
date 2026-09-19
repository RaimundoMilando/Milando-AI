const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const app = express();

const PORT = process.env.PORT || 3000;


// ===============================
// PASTAS
// ===============================

const publicFolder =
  path.join(__dirname, "public");

const uploadFolder =
  path.join(__dirname, "uploads");

const outputFolder =
  path.join(__dirname, "outputs");


if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true
  });
}


if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, {
    recursive: true
  });
}


// ===============================
// UPLOAD
// ===============================

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      cb
    ) {

      cb(
        null,
        uploadFolder
      );

    },


    filename: function (
      req,
      file,
      cb
    ) {

      const extension =
        path.extname(
          file.originalname
        );


      const filename =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1000000
        ) +
        extension;


      cb(
        null,
        filename
      );

    }

  });


const upload =
  multer({

    storage: storage,

    limits: {

      fileSize:
        500 * 1024 * 1024

    }

  });


// ===============================
// MIDDLEWARE
// ===============================

app.use(
  express.json()
);


app.use(
  express.urlencoded({
    extended: true
  })
);


app.use(
  express.static(
    publicFolder
  )
);


app.use(
  "/outputs",
  express.static(
    outputFolder
  )
);


// ===============================
// PÁGINA PRINCIPAL
// ===============================

app.get(
  "/",
  (req, res) => {

    res.sendFile(
      path.join(
        publicFolder,
        "index.html"
      )
    );

  }
);


// ===============================
// PROCESSAMENTO DO VÍDEO
// ===============================

app.post(
  "/api/process-video",
  upload.single("video"),
  (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          message:
            "Nenhum vídeo foi enviado."

        });

      }


      const videoText =
        req.body.videoText || "";


      const inputFile =
        req.file.path;


      const outputName =
        "milando-" +
        Date.now() +
        ".mp4";


      const outputFile =
        path.join(
          outputFolder,
          outputName
        );


      /*
        Se o utilizador escreveu texto,
        colocamos o texto no vídeo.
      */

      let filter = null;


      if (videoText) {

        const safeText =
          videoText
            .replace(/\\/g, "\\\\")
            .replace(/:/g, "\\:")
            .replace(/'/g, "\\'")
            .replace(/%/g, "\\%");


        filter =
          "drawtext=" +
          "text='" +
          safeText +
          "'," +
          "fontcolor=white," +
          "fontsize=48," +
          "x=(w-text_w)/2," +
          "y=h-100," +
          "box=1," +
          "boxcolor=black@0.5," +
          "boxborderw=10";

      }


      const ffmpegArgs = [

        "-y",

        "-i",
        inputFile

      ];


      if (filter) {

        ffmpegArgs.push(
          "-vf",
          filter
        );

      }


      ffmpegArgs.push(

        "-c:v",
        "libx264",

        "-preset",
        "veryfast",

        "-crf",
        "23",

        "-c:a",
        "aac",

        "-movflags",
        "+faststart",

        outputFile

      );


      console.log(
        "A iniciar FFmpeg..."
      );


      execFile(
        "ffmpeg",
        ffmpegArgs,
        (error, stdout, stderr) => {

          if (error) {

            console.error(
              "FFmpeg:",
              error
            );


            return res.status(500).json({

              message:
                "Não foi possível processar o vídeo. Verifica se o FFmpeg está instalado no servidor."

            });

          }


          console.log(
            "Vídeo processado!"
          );


          // Apagar vídeo original
          fs.unlink(
            inputFile,
            () => {}
          );


          res.json({

            success: true,

            message:
              "Vídeo processado com sucesso!",

            videoUrl:
              "/outputs/" +
              outputName

          });

        }

      );


    } catch (error) {

      console.error(error);


      res.status(500).json({

        message:
          "Erro interno do servidor."

      });

    }

  }
);


// ===============================
// STATUS
// ===============================

app.get(
  "/api/status",
  (req, res) => {

    res.json({

      online: true,

      service:
        "Milando AI",

      version:
        "2.0.0"

    });

  }
);


// ===============================
// SERVIDOR
// ===============================

app.listen(
  PORT,
  () => {

    console.log(
      `Milando AI está funcionando na porta ${PORT}`
    );

  }
);
