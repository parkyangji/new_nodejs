const passport = require('passport');
const LocalStratege = require('passport-local');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    passport.use(new LocalStratege(async (id, pa, cb) => {
        let result = await db.collection('user').findOne({ username: id });

        if (!result) {
            return cb(null, false, { message: '아이디 DB에 없음' })
        }

        if (await bcrypt.compare(pa, result.password)) {
            return cb(null, result)
        } else {
            return cb(null, false, { message: '비번불일치' })
        }
    }));

    passport.serializeUser((user, done) => {
        process.nextTick(() => {
            done(null, { id: user._id, username: user.username })
        });
    });

    passport.deserializeUser(async (user, done) => {
        let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) });
        delete result.password;

        process.nextTick(() => {
            done(null, result);
        });
    });
}


