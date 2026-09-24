const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.disable("x-powered-by");

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Identity Field Dynamics</title>
</head>
<body>
  <main>
    <h1>Identity Field Dynamics</h1>
    <p>Formerly developed under the working name Identity Physics.</p>
    <p>The public site is under construction.</p>
  </main>
</body>
</html>`);
});

app.listen(port, () => {
  console.log(`Identity Field Dynamics listening on port ${port}`);
});
