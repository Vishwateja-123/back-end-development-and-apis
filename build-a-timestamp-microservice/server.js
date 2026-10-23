process.env.TZ = "UTC";

import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line

function handleTimestamp(req, res) {
  const { date } = req.params;

  let parsedDate;

  if (!date || date.trim() === "") {
    parsedDate = new Date();
  } else {
    // Check if input is Unix timestamp in milliseconds
    if (/^-?\d+$/.test(date)) {
      parsedDate = new Date(parseInt(date, 10));
    } else {
      parsedDate = new Date(date);
    }
  }

  if (isNaN(parsedDate.getTime())) {
    return res.json({ error: "Invalid Date" });
  }

  return res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString(),
  });
}

app.get("/api", handleTimestamp);
app.get("/api/:date", handleTimestamp);

// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
