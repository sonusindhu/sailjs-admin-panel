module.exports = {


  friendlyName: 'Signup',


  description: 'Sign up for a new user account.',


  extendedDescription:
`This creates a new user record in the database, signs in the requesting user agent
by modifying its [session](https://sailsjs.com/documentation/concepts/sessions), and
(if emailing with Mailgun is enabled) sends an account verification email.

If a verification email is sent, the new user's account is put in an "unconfirmed" state
until they confirm they are using a legitimate email address (by clicking the link in
the account verification message.)`,


  inputs: {

    emailAddress: {
      required: true,
      type: 'string',
      isEmail: true,
      unique: true,
      description: 'The email address for the new account, e.g. m@example.com.',
      extendedDescription: 'Must be a valid email address.',
    },

    password: {
      required: true,
      type: 'string',
      maxLength: 200,
      example: 'passwordlol',
      description: 'The unencrypted password to use for the new account.'
    },

    fullName:  {
      required: true,
      type: 'string',
      example: 'Frida Kahlo de Rivera',
      description: 'The user\'s full name.',
    },
    isSuperAdmin:  {
      type: 'boolean'
    }

  },


  exits: {

    invalid: {
      responseType: 'badRequest',
      description: 'The provided fullName, password and/or email address are invalid.',
      extendedDescription: 'If this request was sent from a graphical user interface, the request '+
      'parameters should have been validated/coerced _before_ they were sent.'
    },

    emailAlreadyInUse: {
      statusCode: 409,
      description: 'The provided email address is already in use.',
    },

  },


  fn: async function (inputs, exits) {
    var req = this.req;
    var res = this.res;
    var newEmailAddress = inputs.emailAddress.toLowerCase();

    // Build up data for the new user record and save it to the database.
    // (Also use `fetch` to retrieve the new ID so that we can use it below.)

    try{

      
      var newUserRecord = await User.create(Object.assign({
        emailAddress: newEmailAddress,
        password: await sails.helpers.passwords.hashPassword(inputs.password),
        fullName: inputs.fullName,
        tosAcceptedByIp: this.req.ip,
        isSuperAdmin: (inputs.isSuperAdmin) ? true : false,
      }, sails.config.custom.verifyEmailAddresses? {
        emailProofToken: await sails.helpers.strings.random('url-friendly'),
        emailProofTokenExpiresAt: Date.now() + sails.config.custom.emailProofTokenTTL,
        emailStatus: 'unconfirmed'
      }:{}))
      //.intercept('E_UNIQUE', ()=>{ return new Error('There is already an account using that email address!') })
      // .intercept({name: 'UsageError'}, function(){
      //   req.flash('error', 'Please fill all the required fields.')
      //   return res.redirect('back');
      // })
      .fetch();

    }

    catch(err){


      //req.session.flash = [];

      if(err.code == 'E_UNIQUE')
        req.flash('error', 'Email is already exist.')
      else
        req.flash('error', 'Please fill all the required fields.')
      
      //sails.log.info('Errors occored', err);

      //return res.badRequest( {error: err.code} );

      return res.redirect('/admin/users/add');
    }
    

    // If billing feaures are enabled, save a new customer entry in the Stripe API.
    // Then persist the Stripe customer id in the database.
    if (sails.config.custom.enableBillingFeatures) {
      let stripeCustomerId = await sails.helpers.stripe.saveBillingInfo.with({
        emailAddress: newEmailAddress
      });
      await User.update(newUserRecord.id).set({
        stripeCustomerId
      });
    }

    

    if (sails.config.custom.verifyEmailAddresses) {
      // Send "confirm account" email
      await sails.helpers.sendTemplateEmail.with({
        to: newEmailAddress,
        subject: 'Please confirm your account',
        template: 'email-verify-account',
        templateData: {
          fullName: inputs.fullName,
          token: newUserRecord.emailProofToken
        }
      });
    } else {
      sails.log.info('Skipping new account email verification... (since `verifyEmailAddresses` is disabled)');
    }

    
    if (req.wantsJSON) {
      // Store the user's new id in their session.
      this.req.session.userId = newUserRecord.id;
      return exits.success();
    } else {
        req.flash('success', 'Account has been successfully created.')
        return res.redirect('/admin/users/add');
    }


    

    // Since everything went ok, send our 200 response.

  }

};
