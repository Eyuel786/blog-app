const express = require("express");

const app = express();

// Put the PORT number in env
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
