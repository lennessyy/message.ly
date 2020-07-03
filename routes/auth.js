const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Message = require('../models/message')
const ExpressError = require('../expressError')
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            throw new ExpressError(message = "Must provide username and password", status = 400)
        }
        const user = await User.authenticate(username, password)
        if (!user) {
            throw new ExpressError(message = "Invalid credentials", status = 400)
        }
        const token = await jwt.sign(user, SECRET_KEY)
        await User.updateLoginTimestamp(username)
        return res.json({ message: "You are logged in", token })
    } catch (e) {
        next(e)
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body
        if (!username || !password || !first_name || !last_name || !phone) {
            throw new ExpressError(message = "Must provide username and password", status = 400)
        }
        const user = await User.register({ username, password, first_name, last_name, phone })
        const to_return = { username: user.username }
        const token = await jwt.sign(to_return, SECRET_KEY)
        return res.status(201).json({ message: "Welcome aboard!", token: token })
    } catch (e) {
        next(e)
    }
})

module.exports = router