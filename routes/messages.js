const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Message = require('../models/message')
const ExpressError = require('../expressError')
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id)
        return res.json(message)
    } catch (e) {

    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', async (req, res, next) => {
    try {
        const from_user = await jwt.verify(req.body.token, SECRET_KEY)
        const { to_username, body } = req.body
        const message = await Message.create({ from_username: from_user.username, to_username: to_username, body: body })
        return res.json({ message: 'Message sent', body: body })

    } catch (e) {
        next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', async (req, res, next) => {
    try {
        const user = jwt.verify(req.body.token, SECRET_KEY)
        const messageID = req.params.id
        const message = await Message.get(messageID)
        if (message.to_user.username !== user.username) {
            throw new ExpressError('You are not the recipient', 400)
        }
        await Message.markRead(messageID)

        return res.json({ msg: 'read', body: message.body })
    } catch (e) {
        next(e)
    }
})

module.exports = router