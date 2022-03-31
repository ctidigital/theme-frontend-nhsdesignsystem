define(
    [
        'jquery',
        'underscore',
        'mage/template',
        'matchMedia',
        'jquery-ui-modules/widget',
        'jquery-ui-modules/core',
        'mage/translate'
    ], function ($, _, mageTemplate) {
        'use strict';

        return function (target) {
            $.widget('mage.quickSearch', target, {
                _create: function () {
                    this._super();

                    /* // Add Close button placeholder to catch close click event
                    // and route it to close the minisearch overlay
                    $('#search_mini_form').append('<div class="minisearch-close-button"></div>');
                    $('#search_mini_form').find('.minisearch-close-button').on('click', function () {
                        this.autoComplete.hide();
                        this.element.blur();
                    }.bind(this));*/

                    // Stop the search from closing automatically on Blur (loses focus), when it is in
                    // small screen mode
                    this.element.off('blur');
                    this.element.on('blur', $.proxy(function () {
                        if (!this.searchLabel.hasClass('active')) {
                            return;
                        }

                        setTimeout($.proxy(function () {
                            if (this.autoComplete.is(':hidden')) {
                                this.setActiveState(false);
                            }
                            if ($(window).width() >= 992) {
                                this.autoComplete.hide();
                            }
                            this._updateAriaHasPopup(false);
                        }, this), 250);
                    }, this));
                },

                _updateAriaPolite: function (resultCount) {
                    if (resultCount) {
                        if ($('#search_autocomplete + .aria-results').length > 0) {
                            $('#search_autocomplete + .aria-results').text('Found ' + resultCount + ' search results.')
                        } else {
                            $('<div class="aria-results nhsuk-u-visually-hidden" aria-live="polite">Found ' + resultCount + ' search results.</div>')
                                .insertAfter('#search_autocomplete');
                        }
                    } else {
                        if ($('#search_autocomplete + .aria-results').length > 0) {
                            $('#search_autocomplete + .aria-results').text('No search results found.')
                        } else {
                            $('<div class="aria-results nhsuk-u-visually-hidden" aria-live="polite" tabindex="-1">No search results found.</div>')
                                .insertAfter('#search_autocomplete');
                        }
                    }
                },
                _onPropertyChange: function () {
                    var searchField = this.element,
                        clonePosition = {
                            position: 'absolute',
                            // Removed to fix display issues
                            // left: searchField.offset().left,
                            // top: searchField.offset().top + searchField.outerHeight(),
                            width: searchField.outerWidth()
                        },
                        source = this.options.template,
                        template = mageTemplate(source),
                        dropdown = $('<ul role="listbox" aria-live="polite"></ul>'),
                        value = this.element.val();

                    this.submitBtn.disabled = true;

                    if (value.length >= parseInt(this.options.minSearchLength, 10)) {
                        this.submitBtn.disabled = false;

                        if (this.options.url !== '') { //eslint-disable-line eqeqeq
                            $.getJSON(this.options.url, {
                                q: value
                            }, $.proxy(function (data) {
                                if (data.length) {
                                    $.each(data, function (index, element) {
                                        var html;

                                        element.index = index;
                                        html = template({
                                            data: element
                                        });
                                        dropdown.append(html);
                                    });

                                    this._resetResponseList(true);

                                    this.responseList.indexList = this.autoComplete.html(dropdown)
                                        .css(clonePosition)
                                        .show()
                                        .find(this.options.responseFieldElements + ':visible');

                                    this.element.removeAttr('aria-activedescendant');

                                    if (this.responseList.indexList.length) {
                                        this._updateAriaHasPopup(true);
                                        this._updateAriaPolite(this.responseList.indexList.length);
                                    } else {
                                        this._updateAriaHasPopup(false);
                                        this._updateAriaPolite(0);
                                    }

                                    this.responseList.indexList
                                        .on('click', function (e) {
                                            this.responseList.selected = $(e.currentTarget);
                                            this.searchForm.trigger('submit');
                                        }.bind(this))
                                        .on('mouseenter mouseleave', function (e) {
                                            this.responseList.indexList.removeClass(this.options.selectClass);
                                            $(e.target).addClass(this.options.selectClass);
                                            this.responseList.selected = $(e.target);
                                            this.element.attr('aria-activedescendant', $(e.target).attr('id'));
                                        }.bind(this))
                                        .on('mouseout', function (e) {
                                            if (!this._getLastElement() &&
                                                this._getLastElement().hasClass(this.options.selectClass)) {
                                                $(e.target).removeClass(this.options.selectClass);
                                                this._resetResponseList(false);
                                            }
                                        }.bind(this));
                                } else {
                                    this._resetResponseList(true);
                                    this.autoComplete.hide();
                                    this._updateAriaHasPopup(false);
                                    this.element.removeAttr('aria-activedescendant');
                                }
                            }, this));
                        }
                    } else {
                        this._resetResponseList(true);
                        this.autoComplete.hide();
                        this._updateAriaHasPopup(false);
                        this.element.removeAttr('aria-activedescendant');
                        if (value.length) {
                            this._updateAriaPolite(0);
                        }
                    }
                }
            });

            return $.mage.quickSearch;
        };
    }
);
