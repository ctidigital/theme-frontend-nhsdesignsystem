define(
    [
        'jquery',
    ], function ($) {
        'use strict';

        var mixin = {
            /**
             * Close modal
             *
             * @return {Promise}
             */
            closeModal: function () {
                this._super();
                if (typeof window._reqlistmodalelaria !== 'undefined') {
                    window._reqlistmodalelaria.focus();
                    window._reqlistmodalelaria = undefined;
                }
            },
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);
