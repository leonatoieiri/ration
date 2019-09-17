module.exports = {
  friendlyName: 'Add friends',

  description: '',

  inputs: {
    friends: {
      description: 'An array of new friends to send request to.',
      type: [
        {
          emailAddress: 'string',
          fullName: 'string'
        }
      ],
      example: [
        {
          emailAddress: 'foo@example.com',
          fullName: 'Foo McFoo'
        }
      ],
      required: true
    }
  },

  exits: {},

  fn: async function(inputs) {
    var desiredFriendEmails = _.pluck(inputs.friends, 'emailAddress');

    var friends = await User.find({
      emailAddress: { in: desiredFriendEmails }
    });

    var existingUserFriendIds = _.pluck(friends, 'id');

    var existingUserEmails = _.pluck(friends, 'emailAddress');

    var newUserEmails = _.difference(desiredFriendEmails, existingUserEmails);

    for (let email of newUserEmails) {
      var token = await sails.helpers.strings.random('url-friendly');

      await User.create({
        emailAddress: email,
        fullName: _.find(input.friends, { emailAddress: email }).fullName,
        emailProofToken: token,
        emailProofTokenExpiresAt:
          Date.now() + sails.config.custom.emailProofTokenTTL,
        emailStatus: 'confirmed'
      });
    }

    await User.addToCollection(
      this.req.me.id,
      'outboundFriendRequests',
      existingUserFriendIds
    );

    return;
  }
};
