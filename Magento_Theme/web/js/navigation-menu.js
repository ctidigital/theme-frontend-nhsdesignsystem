/* global define */
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'matchMedia',
    'globalVars',
    'jquery-ui-modules/menu',
    'jquery/jquery.mobile.custom',
    'mage/translate'
], function ($, mediaCheck, globalVars) {
    'use strict';

    /**
     * Menu Widget - this widget is a wrapper for the jQuery UI Menu
     */
    $.widget('mage.menu', $.ui.menu, {
        options: {
            responsive: false,
            expanded: false,
            showDelay: 42,
            hideDelay: 300,
            mediaBreakpoint: '(max-width: ' +  (globalVars.tweakpointNavToggle - 0.02) + 'px)'
        },

        /**
         * @private
         */
        _create: function () {
            var self = this;

            $(this.element).data('ui-menu', this);
            this._super();
            $(window).on('resize', function () {
                self.element.find('.submenu-reverse').removeClass('submenu-reverse');
            });

            // Overlay when nav open
            self.timerid = -1;
            this.observer = new MutationObserver(function () {
                clearTimeout(self.timerid);
                self.timerid = setTimeout(function () {
                    if ($('.navigation .level-top.ui-state-active').length > 0) {
                        $('body').addClass('nav-open-desktop');
                    } else {
                        $('body').removeClass('nav-open-desktop');
                    }
                    clearTimeout(self.timerid);
                }, 200);
            });

            this.observerConfig = {
                attributes: true
            };


            window.addEventListener('touchstart', function onFirstTouch() {
                // we could use a class
                document.body.classList.add('touch');

                // or set some global variable
                window.TOUCH_ENABLED = true;

                // we only need to know once that a human touched the screen, so we can stop listening now
                window.removeEventListener('touchstart', onFirstTouch, false);
            }, false);
        },

        /**
         * @private
         */
        _init: function () {
            this._super();

            if (this.options.expanded === true) {
                this.isExpanded();
            }

            if (this.options.responsive === true) {
                mediaCheck({
                    media: this.options.mediaBreakpoint,
                    entry: $.proxy(function () {
                        this._toggleMobileMode();
                    }, this),
                    exit: $.proxy(function () {
                        this._toggleDesktopMode();
                    }, this)
                });
            }

            this._assignControls()._listen();
            this._setActiveMenu();
        },

        /**
         * @return {Object}
         * @private
         */
        _assignControls: function () {
            this.controls = {
                toggleBtn: $('[data-action="toggle-nav"]'), // jshint ignore:line
                swipeArea: $('.nav-sections'),
                overlayArea: $('.page-main')
            };

            $('.nav-sections-items').attr('id', 'nav-sections-items');

            return this;
        },

        /**
         * @private
         */
        _listen: function () {
            var controls = this.controls,
                toggle = this.toggle;

            this._on(controls.toggleBtn, {
                'click': toggle
            });
            this._on(controls.swipeArea, {
                'swipeleft': toggle
            });
        },

        /**
         * Toggle.
         */
        toggle: function () {
            var html = $('html'),
                that = this;

            if (html.hasClass('nav-open')) {
                html.removeClass('nav-open');
                setTimeout(function () {
                    html.removeClass('nav-before-open');
                }, this.options.hideDelay);
                this.controls.overlayArea.off('click.closemenu');
                this.controls.toggleBtn.attr('aria-expanded', 'false');
            } else {
                html.addClass('nav-before-open');
                setTimeout(function () {
                    html.addClass('nav-open');
                }, this.options.showDelay);

                that = this;
                this.controls.overlayArea.on('click.closemenu', function () {
                    that.toggle();
                });
                this.controls.toggleBtn.attr('aria-expanded', 'true');
            }
        },

        /**
         * Tries to figure out the active category for current page and add appropriate classes:
         *  - 'active' class for active category
         *  - 'has-active' class for all parents of active category
         *
         *  First, checks whether current URL is URL of category page,
         *  otherwise tries to retrieve category URL in case of current URL is product view page URL
         *  which has category tree path in it.
         *
         * @return void
         * @private
         */
        _setActiveMenu: function () {
            var currentUrl = window.location.href.split('?')[0];

            if (!this._setActiveMenuForCategory(currentUrl)) {
                this._setActiveMenuForProduct(currentUrl);
            }
        },

        /**
         * Looks for category with provided URL and adds 'active' CSS class to it if it was not set before.
         * If menu item has parent categories, sets 'has-active' class to all af them.
         *
         * @param {String} url - possible category URL
         * @returns {Boolean} - true if active category was founded by provided URL, otherwise return false
         * @private
         */
        _setActiveMenuForCategory: function (url) {
            var activeCategoryLink = this.element.find('a[href="' + url + '"]'), // jshint ignore:line
                classes,
                classNav;

            if (!activeCategoryLink || !activeCategoryLink.hasClass('ui-corner-all')) {
                // category was not found by provided URL
                return false;
            } else if (!activeCategoryLink.parent().hasClass('active')) {
                activeCategoryLink.parent().addClass('active');
                classes = activeCategoryLink.parent().attr('class');
                classNav = classes.match(/(nav\-)[0-9]+(\-[0-9]+)+/gi);

                if (classNav) {
                    this._setActiveParent(classNav[0]);
                }
            }

            return true;
        },

        /**
         * Sets 'has-active' CSS class to all parent categories which have part of provided class in childClassName
         *
         * @example
         *  childClassName - 'nav-1-2-3'
         *  CSS class 'has-active' will be added to categories have 'nav-1-2' and 'nav-1' classes
         *
         * @param {String} childClassName - Class name of active category <li> element
         * @return void
         * @private
         */
        _setActiveParent: function (childClassName) {
            var parentElement,
                parentClass = childClassName.substr(0, childClassName.lastIndexOf('-'));

            if (parentClass.lastIndexOf('-') !== -1) {
                parentElement = this.element.find('.' + parentClass);

                if (parentElement) {
                    parentElement.addClass('has-active');
                }
                this._setActiveParent(parentClass);
            }
        },

        /**
         * Tries to retrieve category URL from current URL and mark this category as active
         * @see _setActiveMenuForCategory(url)
         *
         * @example
         *  currentUrl - http://magento.com/category1/category12/product.html,
         *  category URLs has extensions .phtml - http://magento.com/category1.phtml
         *  method sets active category which has URL http://magento.com/category1/category12.phtml
         *
         * @param {String} currentUrl - current page URL without parameters
         * @return void
         * @private
         */
        _setActiveMenuForProduct: function (currentUrl) {
            var categoryUrlExtension,
                lastUrlSection,
                possibleCategoryUrl,
                // retrieve first category URL to know what extension is used for category URLs
                firstCategoryUrl = this.element.find('> li a').attr('href');

            if (firstCategoryUrl) {
                lastUrlSection = firstCategoryUrl.substr(firstCategoryUrl.lastIndexOf('/'));
                categoryUrlExtension = lastUrlSection.lastIndexOf('.') !== -1 ?
                    lastUrlSection.substr(lastUrlSection.lastIndexOf('.')) : '';

                possibleCategoryUrl = currentUrl.substr(0, currentUrl.lastIndexOf('/')) + categoryUrlExtension;
                this._setActiveMenuForCategory(possibleCategoryUrl);
            }
        },

        /**
         * Add class for expanded option.
         */
        isExpanded: function () {
            var subMenus = this.element.find(this.options.menus),
                expandedMenus = subMenus.find(this.options.menus);

            expandedMenus.addClass('expanded');
        },

        /**
         * @param {jQuery.Event} event
         * @private
         */
        _activate: function (event) {
            window.location.href = this.active.find('> a').attr('href');
            this.collapseAll(event);
        },

        /**
         * @param {jQuery.Event} event
         * @private
         */
        _keydown: function (event) {
            var match, prev, character, skip, regex,
                preventDefault = true;

            /* eslint-disable max-depth */
            /**
             * @param {String} value
             */
            function escape(value) {
                return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
            }

            if (this.active.closest(this.options.menus).attr('aria-expanded') !== 'true') { // eslint-disable-line eqeqeq
                switch (event.keyCode) {
                    case $.ui.keyCode.PAGE_UP:
                        this.previousPage(event);
                        break;

                    case $.ui.keyCode.PAGE_DOWN:
                        this.nextPage(event);
                        break;

                    case $.ui.keyCode.HOME:
                        this._move('first', 'first', event);
                        break;

                    case $.ui.keyCode.END:
                        this._move('last', 'last', event);
                        break;

                    case $.ui.keyCode.UP:
                        if ($(window).width() < 991.08) {
                            this.previous(event);
                        } else {
                            this.previous(event);
                        }
                        break;

                    case $.ui.keyCode.DOWN:
                        if ($(window).width() < 991.08) {
                            this.next(event);
                        } else {
                            if (this.active && !this.active.is('.ui-state-disabled')) {
                                this.expand(event);
                            }
                        }
                        break;

                    case $.ui.keyCode.LEFT:
                        if ($(window).width() < 991.08) {

                        } else {
                            this.previous(event);
                        }
                        break;

                    case $.ui.keyCode.RIGHT:
                        if ($(window).width() < 991.08) {

                        } else {
                            this.next(event);
                        }
                        break;

                    case $.ui.keyCode.ENTER:
                    case $.ui.keyCode.SPACE:
                        if ($(window).width() < 991.08) {
                            this.active.click();
                        } else {
                            this._activate(event);
                        }
                        break;

                    case $.ui.keyCode.ESCAPE:
                        this.collapse(event);
                        break;
                    default:
                        preventDefault = false;
                        prev = this.previousFilter || '';
                        character = String.fromCharCode(event.keyCode);
                        skip = false;

                        clearTimeout(this.filterTimer);

                        if (character === prev) {
                            skip = true;
                        } else {
                            character = prev + character;
                        }

                        regex = new RegExp('^' + escape(character), 'i');
                        match = this.activeMenu.children('.ui-menu-item').filter(function () {
                            return regex.test($(this).children('a').text());
                        });
                        match = skip && match.index(this.active.next()) !== -1 ?
                            this.active.nextAll('.ui-menu-item') :
                            match;

                        // If no matches on the current filter, reset to the last character pressed
                        // to move down the menu to the first item that starts with that character
                        if (!match.length) {
                            character = String.fromCharCode(event.keyCode);
                            regex = new RegExp('^' + escape(character), 'i');
                            match = this.activeMenu.children('.ui-menu-item').filter(function () {
                                return regex.test($(this).children('a').text());
                            });
                        }

                        if (match.length) {
                            this.focus(event, match);

                            if (match.length > 1) {
                                this.previousFilter = character;
                                this.filterTimer = this._delay(function () {
                                    delete this.previousFilter;
                                }, 1000);
                            } else {
                                delete this.previousFilter;
                            }
                        } else {
                            delete this.previousFilter;
                        }
                }
            } else {
                switch (event.keyCode) {
                    case $.ui.keyCode.DOWN:
                        this.next(event);
                        break;

                    case $.ui.keyCode.UP:
                        this.previous(event);
                        break;

                    case $.ui.keyCode.RIGHT:
                        if (this.active && !this.active.is('.ui-state-disabled')) {
                            this.expand(event);
                        }
                        break;

                    case $.ui.keyCode.ENTER:
                    case $.ui.keyCode.SPACE:
                        if (this.active.is('.category-back-link')) {
                            var _selfActive = this.active.closest('li.level-top'),
                                _self = this;
                            this.active.click();
                            setTimeout(function () {
                                _self.active = _selfActive.focus();
                            }, 800);
                        } else {
                            this._activate(event);
                        }
                        break;

                    case $.ui.keyCode.LEFT:
                    case $.ui.keyCode.ESCAPE:
                        this.collapse(event);
                        break;
                    default:
                        preventDefault = false;
                        prev = this.previousFilter || '';
                        character = String.fromCharCode(event.keyCode);
                        skip = false;

                        clearTimeout(this.filterTimer);

                        if (character === prev) {
                            skip = true;
                        } else {
                            character = prev + character;
                        }

                        regex = new RegExp('^' + escape(character), 'i');
                        match = this.activeMenu.children('.ui-menu-item').filter(function () {
                            return regex.test($(this).children('a').text());
                        });
                        match = skip && match.index(this.active.next()) !== -1 ?
                            this.active.nextAll('.ui-menu-item') :
                            match;

                        // If no matches on the current filter, reset to the last character pressed
                        // to move down the menu to the first item that starts with that character
                        if (!match.length) {
                            character = String.fromCharCode(event.keyCode);
                            regex = new RegExp('^' + escape(character), 'i');
                            match = this.activeMenu.children('.ui-menu-item').filter(function () {
                                return regex.test($(this).children('a').text());
                            });
                        }

                        if (match.length) {
                            this.focus(event, match);

                            if (match.length > 1) {
                                this.previousFilter = character;
                                this.filterTimer = this._delay(function () {
                                    delete this.previousFilter;
                                }, 1000);
                            } else {
                                delete this.previousFilter;
                            }
                        } else {
                            delete this.previousFilter;
                        }
                }
            }

            /* eslint-enable max-depth */
            if (preventDefault) {
                event.preventDefault();
            }
        },

        /**
         * @private
         */
        _toggleMobileMode: function () {
            var subMenus;

            this._on( this.document, {
                click: function ( event ) {
                    var _menuParentEl;

                    if ( !$( event.target ).closest( '.ui-menu' ).length ) {
                        _menuParentEl = $('nav.navigation');
                        _menuParentEl
                            .removeClass('show-submenu-2')
                            .removeClass('show-submenu-1');
                    }
                }
            });

            this.observer.disconnect();
            $('body').removeClass('nav-open-desktop');

            $(this.element).off('mouseenter mouseleave');

            this._on({
                /**
                 * @param {jQuery.Event} event
                 */
                'click .ui-menu-item:has(a):not(.category-back-link)': function (event) {
                    var target,
                        classList,
                        _menuParentEl;

                    if ($('.nav-open').length <= 0) {
                        return;
                    }

                    event.preventDefault();
                    target = $(event.target).closest('.ui-menu-item');
                    _menuParentEl = this.element.parent();

                    if (!target.hasClass('parent') && target.hasClass('category-back-link') === false) {
                        _menuParentEl
                            .removeClass('show-submenu-2')
                            .removeClass('show-submenu-1');
                        this.collapseAll(event, true);
                        window.location.href = target.find('> a').attr('href');

                        return;
                    }

                    // Add Classes for Transforms
                    classList = target.attr('class').split(' ');
                    $.each(classList, function (index, item) {
                        if (item === 'level0') {
                            _menuParentEl
                                .removeClass('show-submenu-2')
                                .addClass('show-submenu-1');
                        } else if (item === 'level1') {
                            _menuParentEl
                                .removeClass('show-submenu-1')
                                .addClass('show-submenu-2');
                        }
                    });
                },

                /**
                 * @param {jQuery.Event} event
                 */
                'click .ui-menu-item.category-back-link': function (event) {
                    var target,
                        classList,
                        _menuParentEl,
                        _that,
                        tid; // eslint-disable-line no-unused-vars

                    tid = 0;
                    _that = this;
                    target = $(event.target).closest('.submenu');
                    classList = target.attr('class').split(' ');
                    _menuParentEl = _that.element.parent();
                    $.each(classList, function (index, item) {
                        if (item === 'level0') {
                            _menuParentEl
                                .removeClass('show-submenu-2')
                                .removeClass('show-submenu-1');

                            tid = setTimeout(function () {
                                _that.collapseAll(event, true);
                            }, 450);
                        } else if (item === 'level1') {
                            _menuParentEl
                                .removeClass('show-submenu-2')
                                .addClass('show-submenu-1');
                            tid = setTimeout(function () {
                                _that._close();
                            }, 450);
                        } else if (item === 'level2') {
                            _menuParentEl
                                .removeClass('show-submenu-1')
                                .addClass('show-submenu-2');
                            tid = setTimeout(function () {
                                _that._close();
                            }, 450);
                        }
                    });
                }
            });

            subMenus = this.element.find('.level-top, .level1.parent, .level2.parent');

            $.each(subMenus, $.proxy(function (index, item) {
                var category = $(item).find('> a span').not('.ui-menu-icon').text(),
                    categoryUrl = $(item).find('> a').attr('href'),
                    menu = $(item).find('> .ui-menu');

                this.categoryBackLink = $('<a>')
                    .attr('href', '#')
                    .text(category);

                this.categoryLink = $('<a>')
                    .attr('href', categoryUrl)
                    .text($.mage.__('Shop All ') + category);

                this.categoryParent = $('<li>')
                    .addClass('ui-menu-item all-category')
                    .html(this.categoryLink);

                if (menu.find('.all-category').length === 0) {
                    menu.append(this.categoryParent);
                }

                this.categoryBackLinkParent = $('<li>')
                    .addClass('ui-menu-item category-back-link')
                    .html(this.categoryBackLink);

                if (menu.find('.category-back-link').length === 0) {
                    menu.prepend(this.categoryBackLinkParent);
                }
            }, this));
        },

        /**
         * @private
         */
        _toggleDesktopMode: function () {
            var categoryParent, categoryBackLink, html,
                _that,
                subMenus;

            $(this.element).off('mouseenter mouseleave');
            $(this.element.find('.ui-menu-item')).off('mouseenter');
            $('.ui-menu').off('mouseleave');

            $('.navigation').removeClass('show-submenu-1').removeClass('show-submenu-2');
            $('.nav-open').removeClass('nav-open');

            $('ul.level0 > li.level1:first-child').addClass('is-active');

            _that = this;

            $('a.level-top').each(function () {
                _that.observer.observe(this, _that.observerConfig);
            });

            this._on({
                /**
                 * Prevent focus from sticking to links inside menu after clicking
                 * them (focus should always stay on UL during navigation).
                 */
                'mousedown .ui-menu-item > a': function (event) {
                    event.preventDefault();
                },

                /**
                 * Prevent focus from sticking to links inside menu after clicking
                 * them (focus should always stay on UL during navigation).
                 */
                'click .ui-state-disabled > a': function (event) {
                    event.preventDefault();
                },

                'mouseenter li.level1 > a': function (event) {
                    $('li.level1').removeClass('is-active');
                    $(event.currentTarget).parent().addClass('is-active');
                },

                'click li.level1 > a': function (event) {
                    if ($('.nav-open').length > 0) {
                        return;
                    }

                    if (window.TOUCH_ENABLED) {
                        event.preventDefault();
                    }
                },

                /**
                 * @param {jQuer.Event} event
                 */
                'click .ui-menu-item:has(a):not(.category-back-link)': function (event) {
                    var target,
                        $level0,
                        maxHeight,
                        subMenuHeight;

                    if ($('.nav-open').length > 0) {
                        return;
                    }

                    target = $(event.target).closest('.ui-menu-item');

                    if (target.not('.ui-state-disabled').length && target.has('.ui-menu').length && target.hasClass('level0')) {
                        event.preventDefault();


                        // Only set the mouseHandled flag if the event will bubble, see #9469.
                        if (!event.isPropagationStopped()) {
                            this.mouseHandled = true;
                        }

                        // Open submenu on click
                        if (target.has('.ui-menu').length) {
                            if (target.find('> .ui-state-active').length > 0) {
                                this._close();
                            } else {
                                this.collapseAll(event, true);
                                this._close();

                                this.select(event);
                                this.expand(event);
                            }
                        } else if (!this.element.is(':focus') &&
                            $(this.document[0].activeElement).closest('.ui-menu').length
                        ) {
                            // Redirect focus to the menu
                            this.element.trigger('focus', [true]);

                            // If the active item is on the top level, let it stay active.
                            // Otherwise, blur the active item since it is no longer visible.
                            if (this.active && this.active.parents('.ui-menu').length === 1) { // eslint-disable-line
                                clearTimeout(this.timer);
                            }
                        }

                        $level0 = $('ul.level0');
                        maxHeight = $level0.outerHeight();

                        $level0.css({
                            'height': 'auto'
                        });

                        setTimeout(function () {
                            $level0 = $('.ui-state-active + ul.level0');
                            maxHeight = $level0.outerHeight();

                            $('li.level1 > .submenu').each(function () {
                                subMenuHeight = $(this).outerHeight();
                                if (maxHeight < subMenuHeight) {
                                    maxHeight = subMenuHeight;
                                }
                            });

                            $('ul.level0 > .promo-wrapper > .navigation-promo-blocks').each(function () {
                                subMenuHeight = $(this).outerHeight() + 50;
                                if (maxHeight < subMenuHeight) {
                                    maxHeight = subMenuHeight;
                                }
                            });

                            $level0.css({
                                'height': maxHeight + 'px'
                            });
                        }, 100);
                    }
                }

                /**
                 * @param {jQuery.Event} event

                 'mouseenter .ui-menu-item': function (event) {
                    var target = $(event.currentTarget),
                        submenu = this.options.menus,
                        ulElement,
                        ulElementWidth,
                        width,
                        targetPageX,
                        rightBound;

                    if (target.has(submenu)) {
                        ulElement = target.find(submenu);
                        ulElementWidth = ulElement.outerWidth(true);
                        width = target.outerWidth() * 2;
                        targetPageX = target.offset().left;
                        rightBound = $(window).width();

                        if (ulElementWidth + width + targetPageX > rightBound) {
                            ulElement.addClass('submenu-reverse');
                        }

                        if (targetPageX - ulElementWidth < 0) {
                            ulElement.removeClass('submenu-reverse');
                        }
                    }

                    // Remove ui-state-active class from siblings of the newly focused menu item
                    // to avoid a jump caused by adjacent elements both having a class with a border
                    target.siblings().children('.ui-state-active').removeClass('ui-state-active');
                    this.focus(event, target);
                },*/

                /**
                 * @param {jQuery.Event} event
                 */
                /*  'mouseleave': function (event) {
                    this.collapseAll(event, true);
                },*/

                /**
                 * Mouse leave.
                 */
                /*  'mouseleave .ui-menu': 'collapseAll'*/
            });

            $('li.level1').each(function () {
                var categoryName = $(this).find('> a > span:last-child').text();

                $(this).find('> .submenu > li.first').attr('data-category-name', categoryName);
            });

            categoryParent = this.element.find('.all-category');
            categoryBackLink = this.element.find('.category-back-link');
            html = $('html');

            categoryParent.remove();
            categoryBackLink.remove();

            if (html.hasClass('nav-open')) {
                html.removeClass('nav-open');
                setTimeout(function () {
                    html.removeClass('nav-before-open');
                }, 300);
            }

            subMenus = this.element.find('.level-top');

            $.each(subMenus, $.proxy(function (index, item) {
                var category = $(item).find('> a span').not('.ui-menu-icon').text(),
                    categoryUrl = $(item).find('> a').attr('href'),
                    menu = $(item).find('> .ui-menu');

                this.categoryLink = $('<a>')
                    .attr('href', categoryUrl)
                    .text($.mage.__('Shop All ') + category);

                this.categoryParent = $('<li>')
                    .addClass('ui-menu-item all-category')
                    .html(this.categoryLink);

                if (menu.find('.all-category').length === 0) {
                    menu.append(this.categoryParent);
                }
            }, this));
        },

        /**
         * @param {*} handler
         * @param {Number} delay
         * @return {Number}
         * @private
         */
        _delay: function (handler, delay) {
            var instance = this,

                /**
                 * @return {*}
                 */
                handlerProxy = function () {
                    return (typeof handler === 'string' ? instance[handler] : handler).apply(instance, arguments);
                };

            return setTimeout(handlerProxy, delay || 0);
        },

        /**
         * @param {jQuery.Event} event
         */
        expand: function (event) {
            var newItem = this.active &&
                this.active
                    .children('.ui-menu')
                    .children('.ui-menu-item')
                    .first();

            if (newItem && newItem.length) {
                if (newItem.closest('.ui-menu').is(':visible') &&
                    newItem.closest('.ui-menu').has('.all-categories') &&
                    newItem.closest('.ui-menu').has('.category-back-link')
                ) {
                    return;
                }

                this._open(newItem.parent());

                // Delay so Firefox will not hide activedescendant change in expanding submenu from AT
                this._delay(function () {
                    this.focus(event, newItem);
                });
            }
        },

        /**
         * @param {jQuery.Event} event
         */
        select: function (event) {
            var ui;

            this.active = $(event.target).closest('.ui-menu-item');

            if (this.active.is('.all-category') || this.active.is('.category-back-link')) {
                this.active = $(event.target).closest('.ui-menu-item:not(.category-back-link)');
            }
            ui = {
                item: this.active
            };

            if (!this.active.has('.ui-menu').length) {
                this.collapseAll(event, true);
            }
            this._trigger('select', event, ui);
        }
    });

    $.widget('mage.navigation', $.mage.menu, {
        options: {
            responsiveAction: 'wrap', // option for responsive handling
            maxItems: null, // option to set max number of menu items
            container: '#menu', // container to check against navigation length
            moreText: $.mage.__('more'),
            breakpoint: (globalVars.tweakpointNavToggle)
        },

        /**
         * @private
         */
        _init: function () {
            var that, responsive;

            this._super();

            that = this;
            responsive = this.options.responsiveAction;

            this.element
                .addClass('ui-menu-responsive')
                .attr('responsive', 'main');

            this.setupMoreMenu();
            this.setMaxItems();
            // jshint ignore:start
            // check responsive option
            if (responsive == 'onResize') { // eslint-disable-line eqeqeq
                $(window).on('resize', function () {
                    if ($(window).width() > that.options.breakpoint) {
                        that._responsive();
                        $('[responsive=more]').show();
                    } else {
                        that.element.children().show();
                        $('[responsive=more]').hide();
                    }
                });
            } else if (responsive == 'onReload') { // eslint-disable-line eqeqeq
                this._responsive();
            }
            // jshint ignore:end
        },

        /**
         * Setup more menu.
         */
        setupMoreMenu: function () {
            var moreListItems = this.element.children().clone(),
                moreLink = $('<a>' + this.options.moreText + '</a>');

            moreListItems.hide();

            moreLink.attr('href', '#');

            this.moreItemsList = $('<ul>')
                .append(moreListItems);

            this.moreListContainer = $('<li>')
                .append(moreLink)
                .append(this.moreItemsList);

            this.responsiveMenu = $('<ul>')
                .addClass('ui-menu-more')
                .attr('responsive', 'more')
                .append(this.moreListContainer)
                .menu({
                    position: {
                        my: 'right top',
                        at: 'right bottom'
                    }
                })
                .insertAfter(this.element);
        },

        /**
         * @private
         */
        _responsive: function () {
            var container = $(this.options.container),
                containerSize = container.width(),
                width = 0,
                items = this.element.children('li'),
                more = $('.ui-menu-more > li > ul > li a');

            items = items.map(function () {
                var item = {};

                item.item = $(this);
                item.itemSize = $(this).outerWidth();

                return item;
            });

            $.each(items, function (index) {
                var itemText = items[index].item
                    .find('a:first')
                    .text();

                width += parseInt(items[index].itemSize, null); // eslint-disable-line radix

                if (width < containerSize) {
                    items[index].item.show();

                    more.each(function () {
                        var text = $(this).text();

                        if (text === itemText) {
                            $(this).parent().hide();
                        }
                    });
                } else if (width > containerSize) {
                    items[index].item.hide();

                    more.each(function () {
                        var text = $(this).text();

                        if (text === itemText) {
                            $(this).parent().show();
                        }
                    });
                }
            });
        },

        /**
         * Set max items.
         */
        setMaxItems: function () {
            var items = this.element.children('li'),
                itemsCount = items.length,
                maxItems = this.options.maxItems,
                overflow = itemsCount - maxItems,
                overflowItems = items.slice(overflow);

            overflowItems.hide();

            overflowItems.each(function () {
                var itemText = $(this).find('a:first').text();

                $(this).hide();

                $('.ui-menu-more > li > ul > li a').each(function () {
                    var text = $(this).text();

                    if (text === itemText) {
                        $(this).parent().show();
                    }
                });
            });
        }
    });

    return {
        menu: $.mage.menu,
        navigation: $.mage.navigation
    };
});
