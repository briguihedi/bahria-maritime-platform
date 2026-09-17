const express = require('express');
const fs      = require('fs');
const path    = require('path');
const Groq    = require('groq-sdk');
const upload  = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const groq   = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── POST /api/ai/compliance ───────────────────────────────────────────────────
router.post('/compliance', requireAuth, async (req, res) => {
  const { cargo, origin, destination, value } = req.body;
  if (!cargo) return res.status(400).json({ message: 'Description de la marchandise requise.' });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en douane et commerce international tunisien avec 20 ans d'expérience. 
Tu réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`,
        },
        {
          role: 'user',
          content: `Analyse la conformité douanière pour :
Marchandise : ${cargo}
Pays d'origine : ${origin || 'Non précisé'}
Destination : ${destination || 'Tunisie'}
Valeur estimée : ${value || 'Non précisée'} USD

Retourne UNIQUEMENT ce JSON :
{
  "cargo_classification": "classification de la marchandise",
  "hs_code": "code SH douanier (format: XXXX.XX)",
  "risk_level": "Faible | Moyen | Élevé",
  "required_documents": [
    { "name": "nom document", "mandatory": true, "description": "pourquoi nécessaire" }
  ],
  "customs_duties": {
    "import_duty": "taux en %",
    "vat": "TVA applicable",
    "other_taxes": "autres taxes",
    "total_estimated": "estimation totale"
  },
  "restrictions": ["restrictions éventuelles"],
  "alerts": ["alertes importantes"],
  "recommendations": ["conseils pratiques"],
  "estimated_processing_time": "délai estimé",
  "applicable_agreements": ["accords commerciaux applicables"]
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const text   = completion.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]);

    res.json({ success: true, data: parsed, message: 'Analyse générée avec succès.' });

  } catch (err) {
    console.error('AI Compliance Error:', err);
    res.status(500).json({ message: 'Erreur analyse conformité.', error: err.message });
  }
});

// ── POST /api/ai/ocr ──────────────────────────────────────────────────────────
router.post('/ocr', requireAuth, upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier uploadé.' });

  const filePath = req.file.path;

  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType    = req.file.mimetype;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
            {
              type: 'text',
              text: `Analyze this maritime/customs document and extract all information.
You MUST respond with ONLY a valid JSON object, no text before or after, no explanation.
Use this exact structure:
{
  "document_type": "type of document",
  "document_number": "document number",
  "date": "date",
  "shipper": "shipper name",
  "consignee": "consignee name",
  "port_of_loading": "loading port",
  "port_of_discharge": "discharge port",
  "vessel": "vessel name",
  "cargo_description": "cargo description",
  "quantity": "quantity",
  "weight": "weight",
  "value": "value",
  "currency": "currency",
  "country_of_origin": "origin country",
  "incoterms": "incoterms",
  "additional_info": "other important info"
}
IMPORTANT: Return ONLY the JSON, nothing else.`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const text      = completion.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const parsed = JSON.parse(jsonMatch[0]);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, data: parsed, message: 'Document analysé avec succès.' });

  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('AI OCR Error:', err);
    res.status(500).json({ message: 'Erreur analyse document.', error: err.message });
  }
});

module.exports = router;