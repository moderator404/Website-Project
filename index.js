// index.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");
const config = require("./config.json");

const app = express();

// إعداد الجلسة
app.use(session({
  secret: config.session_secret,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// إعداد OAuth2 لـ Discord
passport.use(new DiscordStrategy({
  clientID: config.client_id,
  clientSecret: config.client_secret,
  callbackURL: config.redirect_uri,
  scope: ["identify"]
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// توجيه المستخدم إلى Discord لتسجيل الدخول
app.get("/auth/discord", passport.authenticate("discord"));

// استقبال العودة من Discord
app.get("/auth/discord/callback", passport.authenticate("discord", {
  failureRedirect: "/"
}), (req, res) => {
  res.redirect("/");
});

// تسجيل الخروج
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// تقديم ملفات الموقع
app.use(express.static(path.join(__dirname, "public")));

// تشغيل السيرفر
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
