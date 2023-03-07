// from https://cloudnweb.dev/2021/05/express-typescript-basic-auth/


 let jwt=require("jsonwebtoken");

import { Password } from "../Common/services/password"

const jwtSecret= process.env.JWT_SECRET || "123456"

const tokenExpirationInSeconds = 36000

const log=  require('debug')("auth:controller");
let users=require('../.data/users.json');

class AuthController {
  constructor() {}
  async login(req, res, next) {

    try {
      const email = req.body.email||'';
      const password = req.body.password;
      let user=users[req.body.user] ;

      log("user", user)


      if (user) {
        const isPasswordMatch = await Password.compare(user.password, password)
        if (!isPasswordMatch) {
          throw new Error("Invalid Password")
        } else {
          log("jwt Secret", jwtSecret)
          const token = jwt.sign(req.body, jwtSecret, {
            expiresIn: tokenExpirationInSeconds,
          })
          return res.status(200).json({
            success: true,
            data: user,
            token,
          })
        }
      } else {
        log("User Not Found")
        throw new Error("User Not Found")
      }
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new AuthController()