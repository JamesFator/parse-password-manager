
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.cookieParser('e7879adee1ee6c10fc424661d373c4be'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));


app.get('/', function(req, res) {
    if (!Parse.User.current()) {
        // No user is logged in
        res.redirect('/login');
    } else {
        // User is already logged in
        res.redirect('/accounts');
    }
});


app.get('/register', function(req, res) {
    if (!Parse.User.current()) {
        // No user is logged in
        res.render('register', { error: null } );
    } else {
        // User is already logged in
        res.redirect('/accounts');
    }
});


app.post('/register', function(req, res) {
    if (Parse.User.current()) {
        res.redirect('/accounts');  // Someone is already logged in
        return;
    }
    // Catch any missing requirements
    var errorMsg = null;
    if (!req.body.username) {
        errorMsg = 'Username is required';
    } else if (!req.body.password) {
        errorMsg = 'Password is required';
    } else if (!req.body.email) {
        errorMsg = 'Email is required';
    }
    if (errorMsg) {
        res.render('register', { error: errorMsg } );
        return;
    }

    // Use Parse to register a new user
    var user = new Parse.User();
    user.set("username", req.body.username);
    user.set("password", req.body.password);
    user.set("email", req.body.email);
     
    user.signUp(null, {
      success: function(user) {
        // Let them use the app now.
        user.setACL(new Parse.ACL(user));
        user.save(null, {
            success: function(user) {
                Parse.User.logIn(req.body.username, req.body.password, {
                    success: function(user) {
                        // Successful login.
                        res.redirect('/accounts');
                    },
                    error: function(user, error) {
                        console.log(error.message);
                        res.render('register', { error: error.message } );
                    }
                });
            },
            error: function(error) {
                console.log(error.message);
                res.render('register', { error: error.message } );
            }
        });
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        res.render('register', { error: error.message } );
      }
    });
});


app.get('/login', function(req, res) {
    if (!Parse.User.current()) {
        // No user is logged in
        res.render('login', {} );
    } else {
        // User is already logged in
        res.redirect('/accounts');
    }
});


app.post('/login', function(req, res) {
    // Use Parse to log in
    Parse.User.logIn(req.body.username, req.body.password).then(
    function() {
        // Login succeeded, redirect to list of accounts.
        res.redirect('/accounts');
    },
    function(error) {
        // Login failed, redirect back to login form.
        res.redirect('/login');
    });
});


app.get('/logout', function(req, res) {
    // Log the user out, then redirect to login page
    Parse.User.logOut();
    res.redirect('/login');
});


app.get('/accounts', function(req, res) {
    if (!Parse.User.current()) {
        res.redirect('/login');  // No user is logged in
        return;
    }
    Parse.User.current().fetch().then(function(user) {
        // Render the user profile information
        var usrAccounts = user.get('accounts');
        if (!usrAccounts || usrAccounts.length < 1) {
            res.render('accounts', { accounts: [] } );
        } else {
            Parse.Object.fetchAll(usrAccounts, {
                success: function(list) {
                    // All the objects were fetched.
                    res.render('accounts', { accounts: list } );
                },
                error: function(error) {
                    // An error occurred while fetching one of the objects.
                    res.render('accounts', { accounts: [] } );
                },
            });
        }
    },
    function(error) {
        // Render error page.
        console.log(error.message);
    });
});

app.get('/update', function(req, res) {
    if (!Parse.User.current()) {
        res.redirect('/login');  // No user is logged in
    } else {
        res.render('update', { error: null } );
    }
});


app.post('/update_account', function(req, res) {
    if (!Parse.User.current()) {
        res.redirect('/login');  // No user is logged in
        return;
    }
    // Catch any missing requirements
    var errorMsg = null;
    if (!req.body.accountType) {
        errorMsg = 'Account Type is required';
    } else if (!req.body.username) {
        errorMsg = 'Username is required';
    } else if (!req.body.password) {
        errorMsg = 'Password is required';
    }
    if (errorMsg) {
        res.render('update', { error: errorMsg } );
        return;
    }

    // Declare the Object type
    var Account = Parse.Object.extend('Account');

    var usrAccount = new Account();
    usrAccount.set('type', req.body.accountType);
    usrAccount.set('username', req.body.username);
    usrAccount.set('password', req.body.password);

    // Ensure this data is not open to the public, but to this user
    usrAccount.setACL(new Parse.ACL(Parse.User.current()));

    Parse.User.current().fetch().then(function(user) {
        user.add('accounts', usrAccount);
        user.save(null, {
            success: function(user) {
                res.redirect('/accounts');
            },
            error: function(error) {
                console.log(error.message);
                res.render('update', { error: error.message } );
            }
        });
    },
    function(error) {
        // Render error page.
        console.log(error.message);
        res.render('update', { error: error.message } );
    });
});


// Attach the Express app to Cloud Code.
app.listen();
