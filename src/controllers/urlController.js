import { nanoid } from "nanoid";
import db from "../config/database.js";

export const criarUrl = async (req, res) => {
    const {url} = req.body;
    const {id: userId} = res.locals.sessions;
    const shortUrl = nanoid(10)

    try {
        const {rows: [dados]} = await db.query(`
        INSERT INTO urls (url, "shortUrl", "userId") VALUES ($1, $2, $3) RETURNING id
        `, [url, shortUrl, userId])

        res.status(201).send({
            id: dados.id,
            shortUrl: shortUrl
        })
    } catch (error) {
        res.status(500).send(error)
    }
}

export const pegarUrl = async (req, res) => {
    const {id} = req.params;
    try {
        const {rows: [dados], rowCount} = await db.query(`
        SELECT id, "shortUrl", url FROM urls WHERE id = $1
        `, [id])

        if(rowCount < 1) return res.status(404).send();
       
        res.send(dados)
    } catch (error) {
        res.status(500).send(error)
    }
}

export const redirecionarParaUrl = async (req,res) => {
    const {shortUrl} = req.params;

    try {
        const {rows: [dados]} = await db.query(`   
            SELECT * FROM urls WHERE "shortUrl" = $1`
        , [shortUrl])

        if(!dados) return res.sendStatus(404)

        await db.query(
            `UPDATE urls SET "visitCount" = "visitCount" + 1 WHERE "shortUrl" = $1`
        , [shortUrl])

        res.redirect(dados.url)
    } catch (error) {
        res.status(500).send(error)
    }
}