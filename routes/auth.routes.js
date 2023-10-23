const {Router} = require('express')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jsw = require('jsonwebtoken')
const config = require('../config/default.json')
const {check, validationResult} = require('express-validator')
const router = Router()

// /api/auth/registration
router.post('/registration',
    [check('email', 'error email').isEmail(),
        check('password', 'error password').isLength({min: 6, max: 20})
    ],
     async (req, res) => {
    try {
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array(),
            message: 'error data in registration'
            })
        }

        const {email, password} = req.body
        const candidate = await User.findOne({email})

        if(candidate) {
           return  res.status(400).json({message: 'this user defined'})
        }

        const hashedPassword = await bcrypt.hash(password, 8)
        const user = new User({email, password: hashedPassword})
        await user.save()
        res.status(201).json({message: 'user was created'})

    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'something error, try again'})
    }
})
// /api/auth/login
router.post('/login',
        [check('email', 'error email').normalizeEmail().isEmail(),
        check('password', 'error password').exists()
        ]
    , async (req, res) => {
    try {
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            return res.status(400).json({errors:errors.array(),
            message: 'error data'
            })
        }

        const {email, password} = req.body

        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({message: 'user is not defined'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({message: 'something error'})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get('SECRET_KEY'),
            {expiresIn: '1h'}
        )

        res.json({token, userId: user.id})


    } catch (e) {
        res.status(500).json({message: 'something error try again'})
    }


})


module.exports = router