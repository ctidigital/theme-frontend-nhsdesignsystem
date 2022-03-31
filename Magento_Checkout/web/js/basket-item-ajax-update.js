define([
    'jquery',
    'uiClass',
    'underscore',
    'Magento_Ui/js/modal/alert',
    'Magento_Checkout/js/action/get-totals',
    'Magento_Checkout/js/model/cart/totals-processor/default',
    'Magento_Catalog/js/price-utils',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/totals'
], function ($, Class, _, alert, getTotalsAction, totalsDefaultProvider, priceUtils, quote, totals) {
    'use strict';
    /* jshint camelcase: false */
    return Class.extend({

        defaults: {
            settings: {},
            params: {},
            UPDATE_CART_URL: window.checkout.updateItemQtyUrl
        },

        /**
         * Initializes basket ajax item update.
         * @param {Object} params -  configuration.
         * @param {String} element - String selector of basket ajax items DOM element.
         */
        initialize: function (params, el) {
            this._super();

            this.$el = $(el);
            this.params = params;
            this.params.checkoutMethodsSelector = '.checkout.methods .action';

            // Interval vars for elements
            this.$input = this.$el.find(params.qtySelector);
            this.$panels = this.$el.find(params.updatePanelSelector);
            this.$update = this.$el.find(params.updatePanelActionSelector);
            this.$cancel = this.$el.find(params.updatePanelCancelSelector);
            this.$currentPanel = [];
            this.$currentQtyVal = -1;
            this.forceCartRefresh = (params.forceCartRefresh === 'true');

            if (this.$input.length > 0 &&
                this.$panels.length > 0 &&
                this.$update.length > 0 &&
                this.$cancel.length > 0) {
                this._addEvents();
            }

            this._stickyTotals();
            this._checkoutTopBar();
        },

        _checkoutTopBar: function () {
            this.$proceedToCheckout = $('.totals-sticky-item__action .action.checkout');
            if (this.$proceedToCheckout.length <= 0) {
                return;
            }

            this.$proceedToCheckout.on('click', function (e) {
                e.preventDefault();
                $('.checkout-methods-items .action.checkout').click();
            });
        },

        _stickyTotals: function () {
            var that = this;

            this.$stickyTotalsEl = $('[data-sticky-total]');
            if (this.$stickyTotalsEl.length <= 0) {
                return;
            }

            this._upateStickyTotals(quote.getTotals()().grand_total);

            quote.getTotals().subscribe(function () {
                that._upateStickyTotals(totals.getSegment('grand_total').value);
            });
        },

        _upateStickyTotals: function (val) {
            var _val = priceUtils.formatPrice(val, quote.getPriceFormat());

            this.$stickyTotalsEl.text(_val);
        },

        _addEvents: function () {
            this._addInputEvent();
            this.$update.on('click', $.proxy(this._updateItemQty, this));
            this.$cancel.on('click', $.proxy(this._hideCurrentPanel, this));
        },

        _addInputEvent: function () {
            $.each(this.$input, function () {
                $(this)
                    .data('lastval', $(this).val());
            });
            this.$input.on('input.showpanel change.showpanel paste.showpanel', $.proxy(this._handleInputEvent, this));
        },

        _handleInputEvent: function (e) {
            var $this = $(e.currentTarget),
                value = $this.val(),
                timerId = 0,
                that = this,
                isValidNumber;


            if (value !== '') {
                isValidNumber = value.match(/^\d+$/);

                if (isValidNumber === null) {
                    // If we have no match, value will be current value.
                    $this.val($this.data('lastval'));
                    return;
                }
            }

            if ($this.data('lastval') !== value) {
                clearTimeout(timerId);
                timerId = setTimeout(function () {
                    // change action
                    that._showCurrentPanel(e);
                }, 180);
            }
        },

        _showCurrentPanel: function (e) {
            e.preventDefault();
            this._showPanel(this.$panels.filter('[data-basket-item=' + $(e.currentTarget).data('cart-item') + ']'));
        },

        _hideCurrentPanel: function (e) {
            e.preventDefault();
            this._hidePanel($(e.currentTarget).parent());
            $.each(this.$input, function () {
                $(this).val($(this).data('lastval'));
            });
        },

        _showPanel: function (elem) {
            if (elem.length <= 0) {
                return;
            }

            if (elem.hasClass('is-active')) {
                return;
            }

            elem.addClass('is-active');
            elem.closest('.cart.item')
                .addClass('is-update-active');
            elem.closest('.cart.table')
                .addClass('is-update-active');
        },

        _hidePanel: function (elem) {
            if (elem.length <= 0) {
                return;
            }
            elem.removeClass('is-active');
            elem.closest('.cart.item')
                .removeClass('is-update-active');
            elem.closest('.cart.table')
                .removeClass('is-update-active');
        },

        _refereshSummaryTotals: function () {
            // Below two lines Refreshes the cart summary totals
            // eslint-disable-next-line new-cap
            var deferred = $.Deferred(),
                promise;

            promise = totalsDefaultProvider.estimateTotals(quote.shippingAddress());

            if (typeof promise !== 'undefined' && this.forceCartRefresh !== true) {
                if (typeof promise.then === 'function') {
                    return promise;
                }
            }

            deferred.resolve();
            return deferred;
        },

        _refereshSummaryTotalsComplete: function () {
            var that = this;

            that._hidePanel(that.$currentPanel);
            that._refreshItemsTotal();
            that._refreshCheckoutMethodStates();
            that.$currentPanel.closest('.cart.item').removeClass('is-loading');
            that.$currentPanel = [];
        },

        _refreshItemsTotal: function () {
            var $item = this.$currentPanel.closest('.cart.item'),
                $price = $item.find('.col.price'),
                $totals = $item.find('.col.subtotal'),
                quoteItems,
                $cartItem,
                itemID = -1,
                priceString = '',
                quoteItem,
                $priceSpan,
                prices = [],
                totalUnformatted,
                totalFormatted = '',
                that = this;

            if (this.$currentQtyVal === -1) {
                return;
            }

            quoteItems = (quote.getTotals())().items;

            $price.children().each(function () {
                $cartItem = $(this).parent().parent().find('[data-cart-item]');
                priceString = '';

                if ($cartItem.length > 0) {
                    itemID =  $cartItem.data('cart-item');
                    quoteItem = _.find(quoteItems, function (obj) { return +obj.item_id === +itemID; });

                    if (typeof quoteItem !== 'undefined') {
                        priceString = quoteItem.price;

                        if ($(this).hasClass('price-including-tax')) {
                            priceString = quoteItem.price_incl_tax;
                        }
                    }
                }

                $priceSpan = $(this).find('.price');

                if (priceString !== '') {
                    $priceSpan.text(priceUtils.formatPrice(priceString, quote.getPriceFormat()));
                } else {
                    priceString = $priceSpan.text().replace(/[^0-9\.-]+/g, '');
                }

                prices.push(+(priceString));
            });

            $totals.children().each(function (idx) {
                totalUnformatted = (prices[idx] * that.$currentQtyVal);
                totalFormatted = priceUtils.formatPrice(totalUnformatted, quote.getPriceFormat());
                $(this).find('.price').text(totalFormatted);
            });

            this.$currentQtyVal = -1;
        },

        _refreshCheckoutMethodStates: function () {
            // When there is a minium order amount rule, checkout buttons
            // are disabled in PHTML
            // Force them to be enabled after a qty update
            $(this.params.checkoutMethodsSelector)
                .removeAttr('disabled')
                .removeClass('disabled');
        },

        _updateItemQtyAfter: function () {
            var that = this;

            setTimeout(function () {
                that._refereshSummaryTotals().always(function () {
                    that._refereshSummaryTotalsComplete();
                });
            }, 150);


            $.each(this.$input, function () {
                $(this).data('lastval', $(this).val());
            });
        },

        _updateItemQty: function (e) {
            var itemId,
                // eslint-disable-next-line camelcase
                $_qtyEl,
                isValidNumber;

            if (this.forceCartRefresh === true) {
                $('.cart.actions .action.update').click();
                e.preventDefault();
                return;
            }

            itemId = $(e.currentTarget).data('basket-item-update-action');
            // eslint-disable-next-line camelcase
            $_qtyEl = this.$input.filter('#cart-' + itemId + '-qty');

            if ($_qtyEl.length > 0) {
                this.$currentPanel = $(e.currentTarget).parent();

                isValidNumber = $_qtyEl.val().match(/^\d+$/);

                if (isValidNumber === null) {
                    // If we have no match, value will be current value.
                    $_qtyEl.val($_qtyEl.data('lastval'));
                    return;
                }

                if ($_qtyEl.data('lastval') === $_qtyEl.val()) {
                    this._hidePanel(this.$currentPanel);
                    this.$currentPanel = [];
                    return;
                }

                this.$currentQtyVal = +$_qtyEl.val();

                if (this.$currentQtyVal === 0) {
                    this.$currentPanel.parent('.action-delete').click();
                    return;
                }

                this.$currentPanel.closest('.cart.item').addClass('is-loading');

                this._ajax(this.UPDATE_CART_URL, {
                    item_id: itemId,
                    item_qty: $_qtyEl.val()
                }, $(e.currentTarget), this._updateItemQtyAfter);

                e.preventDefault();
            }
        },

        /**
         * @param {String} url - ajax url
         * @param {Object} data - post data for ajax call
         * @param {Object} elem - element that initiated the event
         * @param {Function} callback - callback method to execute after AJAX success
         */
        _ajax: function (url, data, elem, callback) {
            var _self = this;

            $.extend(data, {
                'form_key': $.mage.cookies.get('form_key')
            });

            $.ajax({
                url: url,
                data: data,
                type: 'post',
                dataType: 'json',
                context: this,
                beforeSend: function () {
                    elem.attr('disabled', 'disabled');
                },
                complete: function () {
                    elem.attr('disabled', null);
                }
            })
                .done(function (response) {
                    var msg;

                    if (response.success) {
                        callback.call(_self, elem, response);
                    } else {
                        msg = response.error_message;

                        _self.$currentPanel.closest('.cart.item').removeClass('is-loading');

                        if (msg) {
                            alert({
                                content: $.mage.__(msg)
                            });
                        }
                    }
                })
                .fail(function (error) {
                    _self.$currentPanel.closest('.cart.item').removeClass('is-loading');
                    // eslint-disable-next-line no-console
                    console.error(JSON.stringify(error));
                });
        }
    });
    /* jshint camelcase: true */
});
