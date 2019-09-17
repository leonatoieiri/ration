module.exports = {
  friendlyName: 'Deliver overdue item notifications',

  description: '',

  fn: async function() {
    var overdueThings = await Thing.find({
      borrowedBy: { '!=': null },
      expectedReturnAt: { '<=': Date.now() - 1000 * 60 * 60 * 12 }
    }).populate('owner');

    for (let overdueThing of overdueThings) {
      await sails.helpers.sendTemplateEmail.with({
        to: overdueThings.owner.emailAddress,
        subject: 'Time to return some items',
        template: 'email-overdue-notice',
        templateData: {
          fullName: overdueThings.owner.fullName,
          label: overdueThings.label
        }
      });
    }
  }
};
