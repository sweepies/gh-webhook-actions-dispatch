const got = require("got")
const express = require("express")
const morgan = require("morgan")
const app = express()

app.use(morgan("combined"))

app.use(express.urlencoded({extended: false}))

app.use("/", (req, res, next) => {
    if (!req.query.key || req.query.key !== process.env.WEBHOOK_KEY) {
        return res.sendStatus(403)
    }

    return next()
})

app.all("*", async (req, res) => {
    const result = await got.post("https://api.github.com", {
        path: req.path,
        headers: {
            "Authorization": "token " + process.env.GH_PAT,
            "Accept": "application/vnd.github.v3+json"
        },
        json: {
            ref: "master"
        },
        responseType: 'json'
    })
    return res.sendStatus(result.statusCode)
})

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log("Listening on %s", port)
})