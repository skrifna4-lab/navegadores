import express from "express";
import cors from "cors";
import { chromium } from "playwright";
import PQueue from "p-queue";

const app = express();

app.use(cors());
app.use(express.json());

// endpoint test
app.get("/", (req, res) => {
    res.send("SCRAPER OK");
});

// cola de 3 navegadores simultáneos
const queue = new PQueue({ concurrency: 3 });

app.post("/scrape", async (req, res) => {
    const { url, script } = req.body;

    if (!url || !script) {
        return res.status(400).json({ error: "url and script are required" });
    }

    try {
        const result = await queue.add(async () => {
            const browser = await chromium.launch({ args: ["--no-sandbox"] });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle" });

            // Esta es la clave: Convertimos el texto recibido en una función ejecutable
            // Pasamos 'page' y 'browser' para que el script tenga control total.
            const dynamicScript = new Function('page', 'browser', `
                return (async () => {
                    ${script}
                })();
            `);

            const data = await dynamicScript(page, browser);

            await browser.close();
            return data;
        });

        res.json({ success: true, data: result });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});
app.listen(6530, () => {
    console.log("API running on port 6530");
});
