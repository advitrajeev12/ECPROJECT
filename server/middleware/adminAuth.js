export const protect = (req, res, next) => {
    if (req.session && req.session.admin) {
        next();
    } else {
        console.log(`[Admin Auth] No session found, redirecting to login. Session ID: ${req.sessionID}`);
        res.redirect('/admin/login');
    }
};
