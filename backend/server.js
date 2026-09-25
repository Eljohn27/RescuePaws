import env from "./config/env.js";
import connectDB from "./config/db.js";
import app from "./app.js";

await connectDB();
app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
