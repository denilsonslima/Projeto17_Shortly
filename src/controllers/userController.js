import db from "../config/database.js";

export const dadosUser = async (req, res) => {
    const token = res.locals.token;
    const dados = await db.query(`
    SELECT 
	u.id AS id, 
	u.name AS name, 
	SUM(url."visitCount") AS "visitCount", 
	json_agg(json_build_object(
		'id', url.id, 
		'shortUrl', url."shortUrl", 
		'url', url.url, 
		'visitCount', url."visitCount"
	)) AS "shortenedUrls"
    FROM users AS u 
    JOIN urls AS url 
        ON u.id = url."userId" 
    JOIN sessions AS s
        ON u.id = s."userId"
    WHERE s.token = $1
    GROUP BY u.id, u.name;
    `, [token])


    res.send(dados.rows[0])
}

export const deletarUsuario = async (req, res) => {
    const token = res.locals.token;
    const id = req.params.id

    const url = await db.query(`
    SELECT * FROM urls WHERE id = $1
    `, [id])

    if(url.rowCount === 0) return res.sendStatus(404)

    const dados = await db.query(`
    SELECT * FROM urls AS u
    JOIN sessions AS s
        ON u."userId" = s."userId"
    JOIN users
        ON users.id = s."userId"
    WHERE s.token = $1 AND u.id = $2 AND users.id = s."userId"
    `, [token, id])

    if(dados.rowCount === 0) return res.sendStatus(401)

    await db.query(`
    DELETE FROM urls WHERE id = $1
    `, [id])

    res.sendStatus(204)
}

export const ranking = async (req, res) => {
    const dados = await db.query(`
    SELECT 
	users.id AS id,
	users.name AS name,
	count(urls."shortUrl") AS "linksCount",
	SUM(urls."visitCount") AS "visitCount"
    FROM users
    JOIN urls
        ON users.id = urls."userId"
    GROUP BY users.id;
    `)

    res.send(dados.rows)
}