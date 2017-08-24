/**
 * PageCreator.js
 * @file Displays information related to a page's creator
 * @author Eizzen <en.wikipedia.org/wiki/User_talk:Eizzen>
 * @license Apache-2.0
 * @external "jQuery"
 * @external "mediawiki.util"
 * @external "mediawiki.api"
 */

/*jslint browser, this:true */
/*global mw, jQuery, window */

mw.loader.using(["mediawiki.util", "mediawiki.api"]).then(function () {
    "use strict";

    /**
     * @class PageCreator
     * @classdesc The central PageCreator class
     */
    var PageCreator = {
        conf: mw.config.get([
            "skin",
            "wgPageName",
            "wgArticleId",
            "wgUserLanguage",
            "wgNamespaceNumber"
        ]),
        lang: {
            main: "Created by $1",
            on: "on $2",
            talk: "talk",
            contribs: "contribs"
        },
        /**
         * @method getData
         * @param {function} callback
         * @returns {void}
         */
        getData: function (callback) {
            var that = this;

            this.api.get({
                action: "query",
                prop: "revisions",
                titles: this.conf.wgPageName,
                rvprop: "ids|timestamp|user|userid",
                rvlimit: "1",
                rvdir: "newer",
                format: "json"
            }).done(function ($data) {
                if (!$data.error) {
                    callback(that, $data);
                }
            });
        },
        /**
         * @method handleData
         * @param {object} that
         * @param {json} $result
         * @returns {void}
         */
        handleData: function (that, $result) {
            var $data = $result.query.pages[that.conf.wgArticleId].revisions[0];
            var $divElement = mw.html.element("div", {id: "page-creator"});

            var $userNameLink =
                    "<a href='/wiki/User:" + $data.user + "'>" + $data.user +
                    "</a> (<a href='/wiki/User_talk:" + $data.user + "'>" +
                    that.lang.talk + "</a> | <a href='/wiki/Special:Contributions/" +
                    $data.user + "'>" + that.lang.contribs + "</a>)";

            if (jQuery("#last-editor").length) {
                jQuery($divElement).insertBefore("#last-editor");
            } else {
                switch (that.conf.skin) {
                case "vector":
                    jQuery($divElement).insertBefore("#siteSub");
                    break;
                case "monobook":
                    jQuery($divElement).prependTo("#bodyContent");
                    break;
                }
            }

            if (that.options.useTimestamp === true) {
                that.handleTimestamps(that, $data, $userNameLink);
            } else {
                jQuery("#page-creator").html(that.lang.main.replace(/\$1/g, $userNameLink));
            }
        },
        /**
         * @method handleTimestamps
         * @param {object} that
         * @param {json} $data
         * @param {string} $link
         * @returns {void}
         */
        handleTimestamps: function (that, $data, $link) {
            var $time;
            var $formattedCreationDate;
            var $creationDateLink;

            if (that.useUTC === true) {
                $time = new Date($data.timestamp).toUTCString();
                $formattedCreationDate = $time.slice(0, 3) + ", " +
                        $time.slice(4, 16) + ", " + $time.slice(17, 25) +
                        " (" + $time.slice(26) + ")";
            } else {
                $time = new Date($data.timestamp).toString();
                $formattedCreationDate = $time.slice(0, 3) + ", " +
                        $time.slice(4, 15) + ", " + $time.slice(16, 24) +
                        " " + $time.slice(34);
            }

            $creationDateLink = "<a href='/?oldid=" + $data.revid + "' target='_blank'>" +
                    $formattedCreationDate + "</a>";

            jQuery("#page-creator")
                .html(
                    that.lang.main.replace(/\$1/g, $link) + " "
                    + that.lang.on.replace(/\$2/g, $creationDateLink)
                );
        },
        /**
         * @method init
         * @returns {void}
         */
        init: function () {
            if (jQuery("#page-creator").length || window.isPageCreatorLoaded) {
                return;
            }
            window.isPageCreatorLoaded = true;

            this.api = new mw.Api();
            this.options = {
                namespaces: [0, 4, 8, 10],
                excluded: [],
                useTimestamp: true,
                useUTC: true
            };

            jQuery.extend(this.options, window.PageCreatorOptions);

            mw.util.addCSS(
                "#page-creator {" +
                    "line-height: normal;" +
                    "font-size: 12px;" +
                    "font-weight: normal;" +
                "}"
            );

            if (
                jQuery.inArray(this.conf.wgNamespaceNumber, this.options.namespaces) !== -1 &&
                jQuery.inArray(this.conf.wgPageName, this.options.excluded) === -1
            ) {
                this.getData(this.handleData);
            }
        }
    };

    jQuery(document).ready(function () {
        PageCreator.init();
    });
});