/* global describe, it */

(function () {
  'use strict';

  describe('BaseFooterView', function() {
    describe('with no options', function() {
      var view;

      beforeEach(function() {
        view = new BackboneBootstrapModals.BaseFooterView();
      });

      it('should render default markup', function() {
        view.render();
        assert.equal(view.el.outerHTML,
                     '<div class="modal-footer"></div>');
      });
    });

    describe('with basic options', function() {
      var view;

      beforeEach(function() {
        view = new BackboneBootstrapModals.BaseFooterView({
          buttons: [
            { className: 'btn btn-default', value: 'Cancel', attributes: { 'data-dismiss': 'modal', 'aria-hidden': 'true' }},
            { id: 'simple-modal-apply-btn', className: 'btn btn-primary', value: 'Apply' }
          ]
        });
      });

      it('should render default markup', function() {
        view.render();
        assert.equal(view.el.outerHTML,
                     '<div class="modal-footer">'+
                       '<button class="btn btn-default" data-dismiss="modal" aria-hidden="true">Cancel</button>'+
                       '<button id="simple-modal-apply-btn" class="btn btn-primary">Apply</button>'+
                     '</div>');
      });
    });
  });
})();
