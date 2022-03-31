define(
    [
        'jquery',
        'Magento_Ui/js/modal/modal'
    ], function ($) {
        'use strict';

        var mixin = {
            /** Show login popup window */
            showModal: function () {
                $(this.modalWindow).modal('openModal');
            }
        };

        return function (target) {
            target.showModal = mixin.showModal;
            return target;
        };
    }
);
