import bodyParser from "body-parser";
import express from "express";

const app = express();
const PORT = 3333;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("views"));

const users = [
  {
    email: "tobi@gmail.com",
    password: "password",
    token: null,
  },
];
function response(res, message = "", code = 404) {
  res.status(code).send({ status: code, message });
}

function getUserByEmail(email) {
  return users.find((user) => user.email === email);
}

function getUserByToken(token) {
  return users.find((user) => user.token === token);
}

function saveUser(user1) {
  const index = users.findIndex((user) => user.email === user1.email);
  users[index] = user1;
}
// insert brilliance here
// Login flow
// {GET} /login - view
// {POST} /login -api
app.post("/login", (req, res) => {
  //get user by username/email
  const { email, password } = req.body;
  if (!email) {
    return response(res, "Please add email", 400);
  }
  if (!password) {
    return response(res, "Please add password", 400);
  }

  const user = getUserByEmail(email);
  if (email == user.email && password == user.password) {
    // res.status(201).json({
    //   token: "superToken",
    // });
    res.redirect("/new-page");
  }
  res.status(400).json({
    error: "unknown error",
  });
});

app.get("/new-page", (req, res) => {
  res.json({
    success: true,
  });
});

// {GET} /reset-password -view
// {PATCH} /reset-password -api
app.post("/reset-password", (req, res) => {
  //get user by username/email
  const { email } = req.body;
  if (!email) {
    return response(res, "Please add email", 400);
  }
  // sendEmail()
  const token = Math.round(Math.random() * 1000);
  const user = getUserByEmail(email);
  user.token = token;
  saveUser(user);
  res.json({
    link: `http://localhost:3333/change-password?token=${token}`,
    user,
  });
});

// {GET} /change-password -view
// {PATCH} /change-password -api
app.post("/change-password", (req, res) => {
  //get user by username/email
  const { token, confirmPassword, newPassword } = req.body;
  if (!token) {
    return response(res, "Please add token", 400);
  }
  if (confirmPassword !== newPassword) {
    return response(res, "Passwords are not equal", 400);
  }

  // confirm token
  // get the user
  const user = getUserByToken(Number(token));
  if (!user) {
    return response(res, "User not found", 404);
  }
  user.password = confirmPassword;
  // change password
  saveUser(user);

  res.json({
    success: true,
    user,
  });
});

app.listen(PORT, () => console.log("server started on port " + PORT));
