const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const uploads = path.join(__dirname, "uploads");
if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true });

const upload = multer({
  dest: uploads,
  limits: { fileSize: 500 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({ ok: true, service: "Milando AI", message: "Servidor online" });
});

app.post("/api/projeto", (req, res) => {
  const { tipo, titulo, historia, personagens, cenas } = req.body;
  if (!titulo) return res.status(400).json({ ok:false, error:"O título é obrigatório." });
  res.json({ ok:true, projeto:{ tipo:tipo||"Filme", titulo, historia:historia||"",
    personagens:personagens||"", cenas:cenas||1 }});
});

app.post("/api/video", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok:false, error:"Nenhum vídeo foi enviado." });

  res.json({
    ok:true,
    status:"recebido",
    message:"Vídeo recebido. O motor de renderização será ligado na próxima etapa.",
    video:{
      nome:req.file.originalname,
      tamanho:req.file.size,
      texto:req.body.texto || "MILANDO AI",
      estilo:req.body.estilo || "Cinematográfico",
      qualidade:req.body.qualidade || "HD",
      cenario:req.body.cenario || "Original",
      efeito:req.body.efeito || "Nenhum"
    }
  });
});

app.listen(PORT, () => console.log("Milando AI server na porta " + PORT));

