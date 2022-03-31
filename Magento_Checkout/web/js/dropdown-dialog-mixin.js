define(['jquery'], function ($) {
    'use strict';

    return function (originalWidget) {
        var timer = null;

        $.widget('mage.dropdownDialog', originalWidget, {
            /**
             *  Check if minicart Delete item
             *  modal is open if so, dont close the
             *  minicart dropdown on close event
             */
            stopOutsideClickOnModal: function () {
                var _self = this;

                if (_self.options.closeOnClickOutside) {
                    // Turn off Default Event
                    $('body').off('click.outsideDropdown');

                    // Add new updated event
                    $('body').on('click.outsideDropdown', function (event) {
                        // If modal and minicart is open then dont close the minicart dropdown
                        if ( $('body').hasClass('_has-modal') && $('body').hasClass('is-minicart-open')) {
                            return;
                        }

                        if (_self._isOpen && !$(event.target).closest('.ui-dialog').length) {
                            if (typeof timer !== 'undefined') {
                                clearTimeout(timer);
                            }
                            _self.close(event);
                        }
                    });
                }
            },

            open: function () {
                this._super();

                // Stop outside click only when minicart & modal open at same time
                if (this.element.hasClass('block-minicart')) {
                    this.stopOutsideClickOnModal();
                }
            }
        });

        return $.mage.dropdownDialog;
    };
});
