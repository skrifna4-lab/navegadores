import express from "express";
import cors from "cors";
import { chromium } from "playwright";
import PQueue from "p-queue";

const app = express();

// habilitar CORS
app.use(cors());

app.use(express.json());

const queue = new PQueue({ concurrency: 3 });

app.post("/scrape", async (req, res) => {
    const { url, script } = req.body;

    if (!url) {
        return res.status(400).json({ error: "url required" });
    }

    queue.add(async () => {
        const browser = await chromium.launch({
            args: ["--no-sandbox"]
        });

        const page = await browser.newPage();
        await page.goto(url);

        let result;

        if (script) {
            result = await page.evaluate(script);
        } else {
            result = await page.title();
        }

        await browser.close();

        res.json({
            success: true,
            data: result
        });
    });
});

app.listen(3000, () => {
    console.log("API running on 3000");
});
