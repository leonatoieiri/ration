parasails.registerPage('available-things', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    things: [],
    confirmDeleteThingModalOpen: false,
    selectedThing: undefined,

    uploadThingModalOpen: false,
    uploadFormData: {
      label: '',
      photo: undefined
    },

    syncing: false,

    formErrors: {},

    cloudError: ''
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function() {
    //…
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    clickDeleteThing: function(thingId) {
      console.log('clicked "delete" button! ' + thingId);
      this.confirmDeleteThingModalOpen = true;
      this.selectedThing = _.find(this.things, { id: thingId });
    },
    closeDeleteThingModal: function() {
      this.selectedThing = undefined;
      this.confirmDeleteThingModalOpen = false;
    },

    handleParsingDeleteThingForm: function() {
      return {
        id: this.selectedThing.id
      };
    },

    submittedDeleteThingForm: function() {
      console.log('ok it works');
      _.remove(this.things, { id: this.selectedThing.id });
      this.$forceUpdate();

      this.closeDeleteThingModal();
    },

    clickAddButton: function() {
      this.uploadThingModalOpen = true;
    },

    _clearUploadThingModal: function() {
      this.uploadThingModalOpen = false;

      this.uploadFormData = {
        label: '',
        photo: undefined
      };

      this.formErrors = {};
      this.cloudError = '';
    },

    closeUploadThingModal: function() {
      this._clearUploadThingModal();
    },

    handleParsingUploadThingForm: function() {
      this.formErrors = {};

      var argins = this.uploadFormData;

      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },

    submittedUploadThingForm: function(result) {
      this.things.push({
        label: this.uploadFormData.label,
        id: result.id,
        owner: {
          id: this.me.id,
          fullName: this.me.fullName
        }
      });
      this._clearUploadThingModal();
    },

    changeFileInput: function(files) {
      if (files.length !== 1 && !this.uploadFormData.photo) {
        throw new Error(
          'Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.'
        );
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.uploadFormData.photo) {
        return;
      }

      this.uploadFormData.photo = selectedFile;

      // Set up the file preview for the UI:
      var reader = new FileReader();
      reader.onload = event => {
        this.uploadFormData.previewImageSrc = event.target.result;

        // Unbind this "onload" event.
        delete reader.onload;
      };
      // Clear out any error messages about not providing an image.
      this.formErrors.photo = false;
      reader.readAsDataURL(selectedFile);
    }
  }
});
