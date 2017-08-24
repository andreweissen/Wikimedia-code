/**
 * SkinSwitcher.js
 * @file Allows for easy switching between seven main skins
 * @author Eizzen <en.wikipedia.org/wiki/User_talk:Eizzen>
 * @license Apache-2.0
 * @external "jQuery"
 * @external "mediawiki.util"
 */

/*jslint browser, this:true */
/*global mw, jQuery, window */

mw.loader.using("mediawiki.util", function () {
    "use strict";

    /**
     * @class SkinSwitcher
     * @classdesc The central SkinSwitcher class
     */
    var SkinSwitcher = {
        lang: {
            script: "Skin Switcher",
            viewIn: "View this page in $1 skin"
        },
        skins: {
            "vector": "Vector",
            "monobook": "MonoBook",
            "modern": "Modern",
            "minerva": "Minerva",
            "minervaneue": "MinervaNeue",
            "cologneblue": "CologneBlue",
            "apioutput": "ApiOutput"
        },
        /**
         * @method constructElement
         * @param {string} $selectedSkin
         * @param {string} $itemText
         * @returns {html}
         */
        constructElement: function ($selectedSkin, $itemText) {
            var $href = window.location.href;
            var $param = (window.location.search)
                ? "&"
                : "?";

            return mw.html.element("li", {
                "id": "skinSwitcher-li-" + $selectedSkin,
                "class": "skinSwitcher-li"
            }, new mw.html.Raw(
                mw.html.element("a", {
                    "href": $href.replace(/#.*/, "") +
                            $param + jQuery.param({useskin: $selectedSkin}),
                    "title": this.lang.viewIn.replace("$1", $itemText),
                    "id": "skinSwitcher-a-" + $selectedSkin,
                    "class": "skinSwitcher-a"
                }, $itemText)
            ));
        },
        /**
         * @method assembleElements
         * @returns {string[] } $elementsArray
         */
        assembleElements: function () {
            var $elementsArray = [];

            Object.keys(this.skins).forEach(function ($property) {
                $elementsArray.push(
                    this.constructElement($property, this.skins[$property])
                );
            }, this);

            return $elementsArray;
        },
        /**
         * @method cloneMenu
         * @param {string} $template
         * @returns {void}
         */
        cloneMenu: function ($template) {
            jQuery($template)
                .clone()
                .attr("id", "skinSwitcher")
                .insertAfter($template);
            jQuery("#skinSwitcher h3")
                .html("<span>" + this.lang.script + "</span>");
            jQuery("#skinSwitcher ul").empty();
        },
        /**
         * @method experimentalPlacement
         * @returns {void}
         */
        experimentalPlacement: function () {
            // Experimental CSS to center links horizontally in header
            mw.util.addCSS(
                "#skinSwitcher {" +
                    "display: flex;" +
                    "justify-content: center;" +
                    "flex-direction: row;" +
                    "align-items: center;" +
                "}" +
                ".skinSwitcher-li {" +
                    "display:inline-block;" +
                    "margin:5px 25px 0 25px;" +
                "}"
            );

            jQuery("<ul>", {
                id: "skinSwitcher"
            }).prependTo(".mw-body");
        },
        /**
         * @method determinePlacement
         * @param {string[] } $assembledElements
         * @returns {void}
         */
        determinePlacement: function ($assembledElements) {
            var $appendLocation;

            switch (this.currentSkin) {
            case "vector":
            case "monobook":
            case "modern":
            case "cologneblue":
                this.cloneMenu("#p-tb");
                $appendLocation = jQuery("#skinSwitcher ul");
                break;
            case "minerva":
            case "minervaneue":
            case "apioutput":
                this.experimentalPlacement();
                $appendLocation = jQuery("#skinSwitcher");
                break;
            }

            $assembledElements.forEach(function ($element) {
                jQuery($element).appendTo($appendLocation);
            });
        },
        /**
         * @method init
         * @returns {void}
         */
        init: function () {
            if (
                window.isSkinSwitcherLoaded ||
                jQuery("#skinSwitcher").length
            ) {
                return;
            }

            window.isSkinSwitcherLoaded = true;
            this.currentSkin = mw.config.get("skin");

            if (this.skins.hasOwnProperty(this.currentSkin)) {
                delete this.skins[this.currentSkin];
                this.determinePlacement(this.assembleElements());
            }
        }
    };

    jQuery(document).ready(function () {
        SkinSwitcher.init();
    });
});