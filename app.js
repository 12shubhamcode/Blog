const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const checkForAuthenticationCookie = require("./middleware/auth");
const Blog = require("./models/blog");

dotenv.config();

const app = express();

connectDB();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
