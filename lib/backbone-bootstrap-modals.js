/*!
  backbone-bootstrap-modals 0.1.0
  http://github.com/leafygreen/backbone-bootstrap-modals

  Licensed under the MIT license.
*/

(function (root, factory) {

  if (typeof define === "function" && define.amd) {
    // AMD (+ global for extensions)
    define(["underscore", "backbone"], function (_, Backbone) {
      return (root.BackboneBootstrapModals = factory(_, Backbone));
    });
  } else if (typeof exports === "object") {
    // CommonJS
    module.exports = factory(require("underscore"), require("backbone"));
  } else {
    // Browser
    root.BackboneBootstrapModals = factory(root._, root.Backbone);
  }}(this, function (_, Backbone) {

  "use strict";

// Create Project Namespace
var BackboneBootstrapModals = {};

// BaseHeaderView
// ---------------------------------
//
// A simple view representing the modal title and dismiss icon.

BackboneBootstrapModals.BaseHeaderView = Backbone.View.extend({
  className: 'modal-header',

  initialize: function (opts) {
    var options = opts || {};
    this.label = options.label || '';
    this.labelId = options.labelId || 'myModalLabel';
    this.labelTagName = options.labelTagName || 'h4';
    this.showClose = (options.showClose !== undefined) ? options.showClose : true;
  },

  render: function() {
    var html = '';
    if (this.showClose) {
      html += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
    }
    html += '<'+this.labelTagName+' id="'+this.labelId+'" class="modal-title">'+this.label+'</'+this.labelTagName+'>';
    this.$el.html(html);
    return this;
  }

});

// BaseBodyView
// ---------------------------------
//
// A simple view representing a minimal modal body

BackboneBootstrapModals.BaseBodyView = Backbone.View.extend({
  className: 'modal-body',
  
  initialize: function (opts) {
    var options = opts || {};
    this.text = options.text;
  },

  render: function() {
    var html = "";
    if (this.text) {
      html += '<p>'+this.text+'</p>';
    }
    this.$el.html(html);
    return this;
  }

});

// BaseFooterView
// ---------------------------------
//
// A simple view representing a set of modal action buttons

BackboneBootstrapModals.BaseFooterView = Backbone.View.extend({
  className: 'modal-footer',

  initialize: function (opts) {
    var options = opts || {};
    this.buttons = options.buttons || [];
  },

  render: function() {
    function createButton(button) {
      var attrs = button.attributes || {},
          attributes = Object.keys(attrs).map(function(key) {
            return key+'="'+attrs[key]+'"';
          }).join(' ');

      var btn = '<button';
      if (button.id) { btn += ' id="'+button.id+'"'; }
      if (button.className) { btn += ' class="'+button.className+'"'; }
      if (attributes) { btn += attributes ;}
      btn += '>';
      if (button.value) { btn += button.value; }
      btn += '</button>';
      return btn;
    }

    var html = this.buttons.map(createButton).join('');
    this.$el.html(html);
    return this;
  }

});

// BaseModal
// ---------------------------------
//
// The base class all other modals extend.

BackboneBootstrapModals.BaseModal = Backbone.View.extend({
  className: 'modal',
  attributes: {
    'tabindex': '-1',
    'role': 'dialog',
    'aria-labelledby': 'myModalLabel'
  },
  
  // Handlers for Bootstrap Modal Events: http://getbootstrap.com/javascript/#modals
  bootstrapModalEvents: {
    'show.bs.modal': 'onShowBsModal',
    'shown.bs.modal': 'onShownBsModal',
    'hide.bs.modal': 'onHideBsModal',
    'hidden.bs.modal': 'onHiddenBsModal'
  },

  // The default views if not overridden or specified in options
  headerView: BackboneBootstrapModals.BaseHeaderView,
  bodyView: BackboneBootstrapModals.BaseBodyView,
  footerView: BackboneBootstrapModals.BaseFooterView,

  // The default modal options if not overridden or specified in options
  modalOptions: {
    backdrop: true,
    keyboard: true
  },

  // properties to copy from options
  modalProperties: [
    'modalOptions',
    'headerView',
    'headerViewOptions',
    'bodyView',
    'bodyViewOptions',
    'footerView',
    'footerViewOptions'
  ],

  constructor: function(opts) {
    var options = opts || {};
    this.shown = false;
    _.extend(this, _.pick(options, this.modalProperties));
    Backbone.View.prototype.constructor.apply(this, arguments);
  },

  render: function() {
    // Remove any existing views before appending subviews to the layout
    this.removeSubviews();
    this.initializeSubviews();

    this.$el.html([
      '<div class="modal-dialog">',
      '<div class="modal-content">',
      '</div>',
      '</div>'
    ].join(''));

    var $modalContent = this.$el.find('.modal-content');

    if (this.headerView) {
      $modalContent.append(this.headerViewInstance.render().$el);
    }

    if (this.bodyView) {
      $modalContent.append(this.bodyViewInstance.render().$el);
    }

    if (this.footerView) {
      $modalContent.append(this.footerViewInstance.render().$el);
    }

    // Allow onRender callback for custom hooks
    if (this.onRender) { this.onRender.call(this); }

    if (!this.shown && this.modalOptions.show !== false) {
        this.$el.modal(this.modalOptions);
    }

    return this;
  },

  // Initialize views for header, body, and footer sections.
  initializeSubviews: function() {
    this.headerViewInstance = this.buildSubview(
      this.getHeaderView(),
      _.result(this, 'headerViewOptions'),
      'modal-header');
    
    this.bodyViewInstance = this.buildSubview(
      this.getBodyView(),
      _.result(this, 'bodyViewOptions'),
      'modal-body');
    
    this.footerViewInstance = this.buildSubview(
      this.getFooterView(),
      _.result(this, 'footerViewOptions'),
      'modal-footer');
  },

  // Accessors that can be overridden to allow dynamic subview definitions
  getHeaderView: function() {
    return this.headerView;
  },

  getBodyView: function() {
    return this.bodyView;
  },

  getFooterView: function() {
    return this.footerView;
  },

  // Construct view instance with specified options and
  // additionally propagate model/collection/className attributes
  buildSubview: function(viewConstructor, viewOptions, className) {
    if (!viewConstructor) {
      throw new Error("view not specified");
    }
    
    var options = _.extend({
      model: this.model,
      collection: this.collection,
      className: className
    }, viewOptions);
    return new viewConstructor(options);
  },

  remove: function () {
    this.removeSubviews();
    Backbone.View.prototype.remove.apply(this, arguments);

    // Allow onClose callback for custom hooks
    if (this.onClose) { this.onClose.call(this); }

    return this;
  },

  removeSubviews: function() {
    if (this.headerViewInstance) { this.removeSubview(this.headerViewInstance); }
    if (this.bodyViewInstance) { this.removeSubview(this.bodyViewInstance);  }
    if (this.footerViewInstance) { this.removeSubview(this.footerViewInstance);  }
  },

  // Attempt to use Marionette's close first, falling back to Backbone's remove
  removeSubview: function(viewInstance) {
    if (Backbone.Marionette && viewInstance.close) {
        viewInstance.close.apply(viewInstance);
    } else if (viewInstance.remove) {
        viewInstance.remove.apply(viewInstance);
    }
  },

  // Override default implementation to always include bootstrapModalEvents
  // without clobbering the default events hash
  delegateEvents: function(events) {
    var combinedEvents = events || _.result(this, 'events') || {};

    _.each(this.getAdditionalEventsToDelegate(), function(eventHash) {
      _.extend(combinedEvents, eventHash);
    });

    Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
  },

  // Helper method for use in overridden delegateEvents call.
  // This can be overridden in extended classes to provide additional
  // events, e.g. ConfirmationModal.confirmationEvents
  getAdditionalEventsToDelegate: function() {
    return [this.bootstrapModalEvents];
  },

  show: function() {
    this.$el.modal('show');
  },

  hide: function() {
    this.$el.modal('hide');
  },

  // This event fires immediately when the show instance method is called.
  onShowBsModal: function() {
    if (this.onShow) { this.onShow.call(this); }
  },

  // This event is fired when the modal has been made visible to the user (will wait for CSS transitions to complete). 
  onShownBsModal: function() {
      this.shown = true;
      if (this.onShown) { this.onShown.call(this); }
  },

  // This event is fired immediately when the hide instance method has been called.
  onHideBsModal: function() {
    if (this.onHide) { this.onHide.call(this); }
  },

  // This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
  onHiddenBsModal: function() {
    this.shown = false;
    this.remove();
    if (this.onHidden) { this.onHidden.call(this); }
  },

});

// ConfirmationModal
// ---------------------------------
//
// A simple modal for simple confirmation dialogs

BackboneBootstrapModals.ConfirmationModal = BackboneBootstrapModals.BaseModal.extend({

  confirmationEvents: {
    'click #confirmation-confirm-btn': 'onClickConfirm'
  },

  // Default set of BaseModal options for use as ConfirmationModal
  headerViewOptions: function() {
    return {
      label: _.result(this, 'label'),
      labelId: _.result(this, 'labelId'),
      labelTagName: _.result(this, 'labelTagName'),
      showClose: _.result(this, 'showClose')
    };
  },

  bodyViewOptions: function() {
    return {
      text: _.result(this, 'text')
    };
  },

  footerViewOptions: function() {
    var buttons = [];
    if (_.result(this, 'showCancel') || true) {
      buttons.push({
        id: 'confirmation-cancel-btn',
        className: 'btn '+ (_.result(this, 'cancelClassName') || 'btn-default'),
        value: (_.result(this, 'cancelText') || 'Cancel'),
        attributes: { 'data-dismiss': 'modal', 'aria-hidden': 'true' }
      });
    }
    buttons.push({
      id: 'confirmation-confirm-btn',
      className: 'btn '+ (_.result(this, 'confirmClassName') || 'btn-primary'),
      value: (_.result(this, 'confirmText') || 'Confirm')
    });
    return {
      buttons: buttons
    };
  },

  // properties to copy from options
  confirmationProperties: [
    'label',
    'labelId',
    'labelTagName',
    'showClose',
    'text',
    'confirmText',
    'confirmClassName',
    'bodyViewOptions',
    'cancelText',
    'cancelClassName',
    'showCancel',
    'onConfirm'
  ],

  initialize: function(opts) {
    var options = opts || {};
    _.extend(this, _.pick(options, this.confirmationProperties));
  },

  // Override BaseModal hook to add additional default delegated events
  getAdditionalEventsToDelegate: function() {
    var eventHashes = BackboneBootstrapModals.BaseModal.prototype.getAdditionalEventsToDelegate.call(this);
    return eventHashes.concat(this.confirmationEvents);
  },

  onClickConfirm: function(e) {
    e.preventDefault();
    e.currentTarget.disabled = true;

    // Execute the specified callback if it exists, then hide the modal.
    // The modal will not be hidden if the callback returns false.
    if (this.onConfirm) {
        if (this.onConfirm.call(this, e) !== false) {
            this.hide();
        }
    } else {
        this.hide();
    }
  }
});

// WizardModal
// ---------------------------------
//
// A simple modal for dialogs with multi-step wizard behavior

BackboneBootstrapModals.WizardModal = BackboneBootstrapModals.BaseModal.extend({

  wizardEvents: {
    'click #confirmation-previous-btn': 'onClickPrevious',
    'click #confirmation-next-btn': 'onClickNext'
  },

  getBodyView: function(options) {
    return this.currentStep.view;
  },

  headerViewOptions: function() {
    return {
      label: this.currentStep.label
    };
  },

  bodyViewOptions: function() {
    return this.currentStep.viewOptions;
  },

  footerViewOptions: function() {
    var buttons = this.getButtonsForCurrentStep();
    return {
      buttons: buttons
    };
  },

  initialize: function(opts) {
    this.initializeSteps(opts);
    this.setCurrentStep(0); // always start with the first element
  },

  initializeSteps: function(opts) {
    // Override any defined stepGraph with the one in options if present
    if (opts.stepGraph) {
      this.stepGraph = opts.stepGraph;
    }
    // Validate the steps structure
    if (!this.stepGraph || !_.isArray(this.stepGraph) || !this.stepGraph.length) {
      throw new Error("steps array must be specified and non-empty");
    }
  },

  setCurrentStep: function(index) {
    this.currentStep = this.stepGraph[index];
  },

  getButtonsForCurrentStep: function() {
    var previousStepIndex = this.currentStep.previousIndex,
        previousText = this.currentStep.previousText || 'Previous',
        previousClassName = this.currentStep.previousClassName || 'btn-default',
        nextStepIndex = this.currentStep.nextIndex,
        nextText = this.currentStep.nextText || 'Next',
        nextClassName = this.currentStep.nextClassName || 'btn-primary',
        buttons = [];
    if (previousStepIndex !== undefined) {
      buttons.push({ id: 'confirmation-previous-btn', className: 'btn '+previousClassName, value: previousText });
    }
    buttons.push({ id: 'confirmation-next-btn', className: 'btn '+nextClassName, value: nextText });
    return buttons;
  },

  // Override BaseModal hook to add additional default delegated events
  getAdditionalEventsToDelegate: function() {
    var eventHashes = BackboneBootstrapModals.BaseModal.prototype.getAdditionalEventsToDelegate.call(this);
    return eventHashes.concat(this.wizardEvents);
  },

  renderPreviousStep: function() {
    this.setCurrentStep(this.currentStep.previousIndex);
    this.render();
  },

  renderNextStep: function() {
    var nextStepIndex = this.currentStep.nextIndex;
    if (nextStepIndex !== undefined) {
      this.setCurrentStep(nextStepIndex);
      this.render();
    } else {
      // If no more steps, hide the dialog
      this.hide();
    }
  },

  onClickPrevious: function(e) {
    e.preventDefault();
    e.currentTarget.disabled = true;
    this.renderPreviousStep();
  },

  onClickNext: function(e) {
    e.preventDefault();
    e.currentTarget.disabled = true;

    // Execute the specified callback if it exists, then proceed.
    // The modal will not proceed if the callback returns false.
    if (this.currentStep.onNext) {
        if (this.currentStep.onNext.call(this, e) === false) {
            return;
        }
    }

    this.renderNextStep();
  }
});


  return BackboneBootstrapModals;
}));