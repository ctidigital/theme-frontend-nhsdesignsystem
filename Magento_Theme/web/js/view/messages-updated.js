/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
/**
 * @api
 */
define([
  'jquery',
  'uiComponent',
  'Magento_Customer/js/customer-data',
  'underscore',
  'escaper',
  'jquery/jquery-storageapi'
], function ($, Component, customerData, _, escaper) {
  'use strict';

  return Component.extend({
    defaults: {
      cookieMessages: [],
      messages: [],
      isHidden: false,
      allowedTags: ['div', 'span', 'b', 'strong', 'i', 'em', 'u', 'a'],
      selector: '.page.messages .messages',
      listens: {
        isHidden: 'onHiddenChange'
      },
      msgTimer: null
    },

    /** @inheritdoc */
    initialize: function () {
      this._super();

      this.cookieMessages = _.unique(
        $.cookieStorage.get('mage-messages'),
        'text'
      );
      this.messages = customerData.get('messages').extend({
        disposableCustomerData: 'messages'
      });

      if (!_.isEmpty(this.messages().messages)) {
        customerData.set('messages', {});
      }

      $.cookieStorage.set('mage-messages', '');
    },
    initObservable: function () {
      this._super().observe('isHidden');

      return this;
    },

    isVisible: function () {
      // enables msg to be shown more than once
      if (this.isHidden()) {
        clearTimeout(this.msgTimer);
        $(this.selector).show();
        this.hideDelay();
      }

      return this.isHidden(
        !_.isEmpty(this.messages().messages) || !_.isEmpty(this.cookieMessages)
      );
    },

    removeAll: function (item, event) {
      var targetHref = $(event.target).attr('href');

      $(this.selector).hide();

      // If clicked target is a link, then follow the link
      if (targetHref) {
        window.location.href = targetHref;
      }
    },

    onHiddenChange: function (isHidden) {
      if (isHidden) {
        this.hideDelay();
      }
    },

    hideDelay: function () {
      // this.msgTimer = setTimeout(
      //   $.proxy(function () {
      //     $(this.selector).hide();
      //   }, this),
      //   5000
      // );
    },

    prepareMessageForHtml: function (message) {
      return escaper.escapeHtml(message, this.allowedTags);
    }
  });
});
