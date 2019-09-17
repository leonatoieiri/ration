module.exports = {
  friendlyName: 'Download photo',

  description: 'Download photo file (returning a stream).',

  inputs: {
    id: {
      description: 'The Id of the thing whose photo we are downloading',
      type: 'number',
      required: true
    }
  },

  exits: {
    success: {
      outputDescription: 'The streaming bytes of the specified things photos',
      outputType: 'ref'
    },
    notFound: {
      responseType: 'notFound'
    },
    forbidden: {
      responseType: 'forbidden'
    }
  },

  fn: async function(inputs, exits) {
    var thing = await Thing.findOne({ id: inputs.id });

    if (!thing) {
      throw 'notFound';
    }

    var friends = User.findOne({ id: this.req.me.id }).populate('friends');
    if (this.req.me.id !== this.owner && !_.any(friends, { id: thing.owner })) {
      throw 'forbidden';
    }

    this.res.type(thing.imageUploadMime);

    var downloading = await sails.startDownload(thing.imageUploadFd);

    return exits.success(downloading);
  }
};
